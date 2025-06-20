import { interpret } from 'xstate';
import createStateMachine from './create-state-machine.js';
import logger from '#utils/logger.js';
import appealRepository from '#repositories/appeal.repository.js';
import appealStatusRepository from '#repositories/appeal-status.repository.js';
import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import {
	AUDIT_TRAIL_PROGRESSED_TO_STATUS,
	APPEAL_TYPE_SHORTHAND_HAS,
	APPEAL_TYPE_SHORTHAND_FPA,
	VALIDATION_OUTCOME_COMPLETE
} from '@pins/appeals/constants/support.js';
import { APPEAL_CASE_PROCEDURE, APPEAL_CASE_STATUS } from 'pins-data-model';
import isFPA from '@pins/appeals/utils/is-fpa.js';
import { currentStatus } from '#utils/current-status.js';

/** @typedef {import('#db-client').AppealType} AppealType */
/** @typedef {import('#db-client').AppealStatus} AppealStatus */
/** @typedef {import('xstate').StateValue} StateValue */

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

	const stateMachine = createStateMachine(appealTypeKey, procedureKey, currentState);
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
		return;
	}

	await appealStatusRepository.updateAppealStatusByAppealId(appealId, newState);

	createAuditTrail({
		appealId,
		azureAdUserId,
		details: stringTokenReplacement(AUDIT_TRAIL_PROGRESSED_TO_STATUS, [newState])
	});

	if (
		newState === APPEAL_CASE_STATUS.EVENT &&
		[APPEAL_TYPE_SHORTHAND_HAS, APPEAL_TYPE_SHORTHAND_FPA].includes(appealType.key) &&
		((appeal.procedureType?.key === APPEAL_CASE_PROCEDURE.WRITTEN && appeal.siteVisit) ||
			(appeal.procedureType?.key === APPEAL_CASE_PROCEDURE.HEARING &&
				appeal.hearing &&
				appeal.hearing?.addressId))
	) {
		transitionState(appealId, azureAdUserId, VALIDATION_OUTCOME_COMPLETE);
	}

	stateMachineService.stop();
};

export default transitionState;
