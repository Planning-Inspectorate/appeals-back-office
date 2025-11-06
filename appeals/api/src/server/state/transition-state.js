import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';
import { mapCompletedStateList } from '#mappers/api/shared/map-completed-state-list.js';
import appealStatusRepository from '#repositories/appeal-status.repository.js';
import appealRepository from '#repositories/appeal.repository.js';
import representationRepository from '#repositories/representation.repository.js';
import { currentStatus } from '#utils/current-status.js';
import { isChildAppeal } from '#utils/is-linked-appeal.js';
import logger from '#utils/logger.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import { updatePersonalList } from '#utils/update-personal-list.js';
import {
	APPEAL_REPRESENTATION_STATUS,
	APPEAL_REPRESENTATION_TYPE
} from '@pins/appeals/constants/common.js';
import {
	APPEAL_TYPE_SHORTHAND_FPA,
	APPEAL_TYPE_SHORTHAND_HAS,
	AUDIT_TRAIL_PROGRESSED_TO_STATUS,
	AUDIT_TRIAL_AUTOMATIC_EVENT_UUID,
	CASE_RELATIONSHIP_LINKED,
	VALIDATION_OUTCOME_COMPLETE
} from '@pins/appeals/constants/support.js';
import isFPA from '@pins/appeals/utils/is-fpa.js';
import { APPEAL_CASE_PROCEDURE, APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import { interpret } from 'xstate';
import createStateMachine from './create-state-machine.js';

/** @typedef {import('#db-client').AppealType} AppealType */
/** @typedef {import('#db-client').AppealStatus} AppealStatus */
/** @typedef {import('xstate').StateValue} StateValue */
/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/**
 * @param {number} appealId
 * @param {string} azureAdUserId
 * @param {string} trigger
 */
const transitionState = async (appealId, azureAdUserId, trigger) => {
	const appeal = await appealRepository.getAppealById(appealId);

	if (!appeal) {
		throw new Error(`no appeal exists with ID: ${appealId}`);
	}

	const { appealStatus, appealType, procedureType } = appeal;
	if (!appealStatus || !appealType) {
		throw new Error(`appeal with ID ${appealId} is missing fields required to transition state`);
	}

	const currentState = currentStatus(appeal);

	if (!procedureType) {
		logger.info(`Procedure type not set for appeal ${appealId}, defaulting to written`);
	}

	const procedureKey = procedureType?.key ?? APPEAL_CASE_PROCEDURE.WRITTEN;
	const appealTypeKey = isFPA(appealType.key)
		? APPEAL_TYPE_SHORTHAND_FPA
		: APPEAL_TYPE_SHORTHAND_HAS;

	const eventElapsed = getEventElapsed(appeal, appealType, procedureKey);

	const stateMachine = createStateMachine(appealTypeKey, procedureKey, currentState, eventElapsed);
	const stateMachineService = interpret(stateMachine);

	stateMachineService.onTransition((/** @type {{value: StateValue}} */ state) => {
		if (state.value !== currentState) {
			logger.debug(`Appeal ${appealId} transitioned from ${currentState} to ${state.value}`);
		}
	});
	stateMachineService.start();
	stateMachineService.send({ type: trigger });

	const newState = String(stateMachineService.state.value);

	if (newState === currentState) {
		stateMachineService.stop();
		if (!isChildAppeal(appeal)) {
			await updatePersonalList(appealId);
		}
		return;
	}

	if (isStatePassed(appeal, newState)) {
		await appealStatusRepository.rollBackAppealStatusTo(appealId, newState);
	} else {
		await appealStatusRepository.updateAppealStatusByAppealId(appealId, newState);
	}

	if (newState === 'issue_determination') azureAdUserId = AUDIT_TRIAL_AUTOMATIC_EVENT_UUID;

	createAuditTrail({
		appealId,
		azureAdUserId,
		details: stringTokenReplacement(AUDIT_TRAIL_PROGRESSED_TO_STATUS, [newState])
	});

	if (
		newState === APPEAL_CASE_STATUS.EVENT &&
		[APPEAL_TYPE_SHORTHAND_HAS, APPEAL_TYPE_SHORTHAND_FPA].includes(appealTypeKey) &&
		((procedureKey === APPEAL_CASE_PROCEDURE.WRITTEN && appeal.siteVisit) ||
			(procedureKey === APPEAL_CASE_PROCEDURE.HEARING &&
				appeal.hearing &&
				appeal.hearing?.addressId) ||
			(procedureKey === APPEAL_CASE_PROCEDURE.INQUIRY &&
				appeal.inquiry &&
				appeal.inquiry?.addressId))
	) {
		await transitionState(appealId, azureAdUserId, VALIDATION_OUTCOME_COMPLETE);
	}

	if (
		newState === APPEAL_CASE_STATUS.EVIDENCE &&
		[APPEAL_TYPE_SHORTHAND_FPA].includes(appealTypeKey) &&
		procedureKey === APPEAL_CASE_PROCEDURE.INQUIRY
	) {
		const evidenceRepresentations = await representationRepository.getRepresentations(appealId, {
			representationType: [
				APPEAL_REPRESENTATION_TYPE.LPA_PROOFS_EVIDENCE,
				APPEAL_REPRESENTATION_TYPE.APPELLANT_PROOFS_EVIDENCE
			]
		});
		const appellantProofOfEvidenceRep = evidenceRepresentations.comments.find(
			(r) => r.representationType === APPEAL_REPRESENTATION_TYPE.APPELLANT_PROOFS_EVIDENCE
		);
		const lpaProofOfEvidenceRep = evidenceRepresentations.comments.find(
			(r) => r.representationType === APPEAL_REPRESENTATION_TYPE.LPA_PROOFS_EVIDENCE
		);

		if (
			[APPEAL_REPRESENTATION_STATUS.VALID, APPEAL_REPRESENTATION_STATUS.INCOMPLETE].includes(
				lpaProofOfEvidenceRep?.status
			) &&
			[APPEAL_REPRESENTATION_STATUS.VALID, APPEAL_REPRESENTATION_STATUS.INCOMPLETE].includes(
				appellantProofOfEvidenceRep?.status
			)
		) {
			await transitionState(appealId, azureAdUserId, VALIDATION_OUTCOME_COMPLETE);
		}
	}

	if (!isChildAppeal(appeal)) {
		await updatePersonalList(appealId);
	}

	stateMachineService.stop();
};

/**
 *
 * @param {Appeal} appeal
 * @param {string} azureAdUserId
 * @param {string} trigger
 * @returns {Promise<void>}
 */
async function transitionLinkedChildAppealsState(appeal, azureAdUserId, trigger) {
	if (appeal.childAppeals?.length) {
		await Promise.all(
			appeal.childAppeals
				.filter(
					(childAppeal) =>
						childAppeal.type === CASE_RELATIONSHIP_LINKED &&
						childAppeal.child &&
						currentStatus(childAppeal.child) === currentStatus(appeal)
				)
				.map((childAppeal) =>
					// @ts-ignore
					transitionState(childAppeal.childId, azureAdUserId, trigger)
				)
		);
	}
}

/**
 *
 * @param {Appeal} appeal
 * @param {string} newState
 * @returns {boolean}
 */
const isStatePassed = (appeal, newState) => {
	const completedStateList = mapCompletedStateList({ appeal });
	return completedStateList.includes(newState);
};

/**
 *
 * @param {Appeal} appeal
 * @param {AppealType} appealType
 * @param {string} procedureType
 */
const getEventElapsed = (appeal, appealType, procedureType) => {
	if (appealType) {
		switch (procedureType) {
			case APPEAL_CASE_PROCEDURE.HEARING:
				//TODO: different behaviour for hearings
				break;
			case APPEAL_CASE_PROCEDURE.INQUIRY:
				//TODO: different behaviour for inquiry
				break;
			case APPEAL_CASE_PROCEDURE.WRITTEN:
			default:
				return appeal.siteVisit?.visitDate
					? new Date(appeal.siteVisit?.visitDate) < new Date()
					: false;
		}
	}
	return false;
};

export default transitionState;
export { transitionLinkedChildAppealsState };
