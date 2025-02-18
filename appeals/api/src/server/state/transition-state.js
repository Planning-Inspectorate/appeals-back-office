import { interpret } from 'xstate';
import createStateMachine from './create-state-machine.js';
import logger from '#utils/logger.js';
import appealRepository from '#repositories/appeal.repository.js';
import appealStatusRepository from '#repositories/appeal-status.repository.js';
import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import { AUDIT_TRAIL_PROGRESSED_TO_STATUS } from '#endpoints/constants.js';

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
	if (!(appealStatus && appealType && procedureType)) {
		throw new Error(`appeal with ID ${appealId} is missing fields required to transition state`);
	}

	const currentState = appealStatus[0].status;

	const stateMachine = createStateMachine(appealType.key, procedureType.key, currentState);
	const stateMachineService = interpret(stateMachine);

	stateMachineService.onTransition((/** @type {{value: StateValue}} */ state) => {
		if (state.value !== currentState) {
			logger.debug(`Appeal ${appealId} transitioned from ${currentState} to ${state.value}`);
		}
	});
	stateMachineService.start();
	stateMachineService.send({ type: trigger });

	const newState = String(stateMachineService.state.value);

	if (newState !== currentState) {
		await appealStatusRepository.updateAppealStatusByAppealId(appealId, newState);

		createAuditTrail({
			appealId,
			azureAdUserId,
			details: stringTokenReplacement(AUDIT_TRAIL_PROGRESSED_TO_STATUS, [newState])
		});
	}

	stateMachineService.stop();
};

export default transitionState;
