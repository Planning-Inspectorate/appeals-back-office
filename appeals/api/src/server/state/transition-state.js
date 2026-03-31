import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';
import { mapCompletedStateList } from '#mappers/api/shared/map-completed-state-list.js';
import appealStatusRepository from '#repositories/appeal-status.repository.js';
import appealRepository from '#repositories/appeal.repository.js';
import representationRepository from '#repositories/representation.repository.js';
import { currentStatus } from '#utils/current-status.js';
import { isChildAppeal } from '#utils/is-linked-appeal.js';
import logger from '#utils/logger.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import { setPersonalList } from '#utils/update-personal-list.js';
import {
	APPEAL_REPRESENTATION_STATUS,
	APPEAL_REPRESENTATION_TYPE
} from '@pins/appeals/constants/common.js';
import {
	AUDIT_TRAIL_PROGRESSED_TO_STATUS,
	AUDIT_TRIAL_AUTOMATIC_EVENT_UUID,
	CASE_RELATIONSHIP_LINKED,
	VALIDATION_OUTCOME_COMPLETE
} from '@pins/appeals/constants/support.js';
import {
	isExpeditedAppealType,
	isLdcOrDiscontinuanceOrEnforcementCaseType
} from '@pins/appeals/utils/appeal-type-checks.js';
import { nextUKDay } from '@pins/appeals/utils/date-utils.js';
import { normaliseProcedureType } from '@pins/appeals/utils/procedure-type.js';
import {
	APPEAL_CASE_PROCEDURE,
	APPEAL_CASE_STATUS,
	APPEAL_CASE_TYPE
} from '@planning-inspectorate/data-model';
import { interpret } from 'xstate';
import createStateMachine from './create-state-machine.js';

/** @typedef {import('#db-client/client.ts').AppealType} AppealType */
/** @typedef {import('#db-client/client.ts').AppealStatus} AppealStatus */
/** @typedef {import('xstate').StateValue} StateValue */
/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/**
 * @param {number} appealId
 * @param {string} azureAdUserId
 * @param {string} trigger
 * @returns {Promise<boolean>} true if the state was transitioned
 */
const transitionState = async (appealId, azureAdUserId, trigger) => {
	const appeal = await appealRepository.getAppealById(appealId, true, [
		'appealStatus',
		'appealType',
		'procedureType',
		'siteVisit',
		'hearing',
		'inquiry',
		'childAppeals'
	]);

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
	const normalisedProcedureKey = /** @type {string} */ (normaliseProcedureType(procedureKey));
	const normalizedAppealTypeKey = !isExpeditedAppealType(appealType.key)
		? APPEAL_CASE_TYPE.W
		: APPEAL_CASE_TYPE.D;
	const isLdcOrDiscontinuanceOrEnforcement = isLdcOrDiscontinuanceOrEnforcementCaseType(
		appealType.key
	);

	const eventElapsed = getEventElapsed(appeal, appealType, normalisedProcedureKey);

	const stateMachine = createStateMachine(
		normalizedAppealTypeKey,
		procedureKey,
		currentState,
		eventElapsed,
		isLdcOrDiscontinuanceOrEnforcement
	);
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
			await setPersonalList({ appealId });
		}
		return false;
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
		[APPEAL_CASE_TYPE.D, APPEAL_CASE_TYPE.W].includes(normalizedAppealTypeKey) &&
		((normalisedProcedureKey === APPEAL_CASE_PROCEDURE.WRITTEN && appeal.siteVisit?.visitDate) ||
			(normalisedProcedureKey === APPEAL_CASE_PROCEDURE.HEARING &&
				appeal.hearing &&
				appeal.hearing?.addressId) ||
			(normalisedProcedureKey === APPEAL_CASE_PROCEDURE.INQUIRY &&
				appeal.inquiry &&
				appeal.inquiry?.addressId))
	) {
		await transitionState(appealId, azureAdUserId, VALIDATION_OUTCOME_COMPLETE);
	}

	if (
		newState === APPEAL_CASE_STATUS.EVIDENCE &&
		//@ts-ignore
		[APPEAL_CASE_TYPE.W].includes(normalizedAppealTypeKey) &&
		procedureKey === APPEAL_CASE_PROCEDURE.INQUIRY
	) {
		const evidenceRepresentations = await representationRepository.getRepresentations([appealId], {
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
		await setPersonalList({ appealId });
	}

	stateMachineService.stop();
	return true;
};

/**
 *
 * @param {Appeal} appeal
 * @param {string} azureAdUserId
 * @param {string} trigger
 * @returns {Promise<number[]>} IDs of child appeals that were transitioned
 */
async function transitionLinkedChildAppealsState(appeal, azureAdUserId, trigger) {
	/** @type {number[]} */
	const updatedChildren = [];
	if (appeal.childAppeals?.length) {
		await Promise.all(
			appeal.childAppeals
				.filter(
					(childAppeal) =>
						childAppeal.type === CASE_RELATIONSHIP_LINKED &&
						childAppeal.child &&
						currentStatus(childAppeal.child) === currentStatus(appeal)
				)
				.map(async (childAppeal) => {
					// @ts-ignore
					const result = await transitionState(childAppeal.childId, azureAdUserId, trigger);
					if (result && childAppeal.childId) {
						updatedChildren.push(childAppeal.childId);
					}
				})
		);
	}
	return updatedChildren;
}

/**
 *
 * @param {Appeal} appeal
 * @param {string} newState
 * @returns {boolean}
 */
export const isStatePassed = (appeal, newState) => {
	const completedStateList = mapCompletedStateList({ appeal });
	return completedStateList.includes(newState);
};

/**
 *
 * @param {Appeal} appeal
 * @param {AppealType} appealType
 * @param {string} procedureType
 */
export const getEventElapsed = (appeal, appealType, procedureType) => {
	if (appealType) {
		switch (procedureType) {
			case APPEAL_CASE_PROCEDURE.HEARING:
				if (!appeal.hearing) {
					return false;
				}

				if (appeal.hearing.hearingEndTime) {
					return appeal.hearing.hearingEndTime < new Date();
				}

				if (appeal.hearing.hearingStartTime) {
					return nextUKDay(appeal.hearing.hearingStartTime) < new Date();
				}
				break;
			case APPEAL_CASE_PROCEDURE.INQUIRY:
				if (!appeal.inquiry) {
					return false;
				}

				if (appeal.inquiry.inquiryEndTime) {
					return appeal.inquiry.inquiryEndTime < new Date();
				}

				if (appeal.inquiry.inquiryStartTime) {
					return nextUKDay(appeal.inquiry.inquiryStartTime) < new Date();
				}
				break;
			case APPEAL_CASE_PROCEDURE.WRITTEN:
			default:
				return appeal.siteVisit?.visitDate
					? nextUKDay(appeal.siteVisit?.visitDate) < new Date()
					: false;
		}
	}
	return false;
};

export default transitionState;
export { transitionLinkedChildAppealsState };
