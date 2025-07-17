import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';
import createStateMachine from './create-state-machine.js';
import logger from '#utils/logger.js';
import {
	APPEAL_TYPE_SHORTHAND_HAS,
	APPEAL_TYPE_SHORTHAND_FPA
} from '@pins/appeals/constants/support.js';
import isFPA from '@pins/appeals/utils/is-fpa.js';

/** @typedef {import('#db-client').AppealType} AppealType */
/** @typedef {import('#db-client').ProcedureType} ProcedureType */
/** @typedef {import('@pins/appeals.api').Appeals.StateStub} StateStub */

/**
 * @param {AppealType} appealType
 * @param {ProcedureType | null} procedureType
 * @param {string} currentState
 * @returns {StateStub[]}
 * */
function listStates(appealType, procedureType, currentState) {
	const appealTypeKey = isFPA(appealType.key)
		? APPEAL_TYPE_SHORTHAND_FPA
		: APPEAL_TYPE_SHORTHAND_HAS;
	const stateMachine = createStateMachine(
		appealTypeKey,
		procedureType?.key || APPEAL_CASE_PROCEDURE.WRITTEN,
		currentState
	);
	const { states } = stateMachine;

	if (!procedureType) {
		logger.info('Procedure type not set, defaulting to written');
	}

	const stateList = Object.keys(states)
		.filter((key) => {
			const state = states[key];
			const { validAppealTypes, validProcedureTypes } = state.meta;

			if (!procedureType) {
				return validAppealTypes.includes(appealTypeKey);
			}

			return (
				validAppealTypes.includes(appealTypeKey) && validProcedureTypes.includes(procedureType.key)
			);
		})
		.sort((a, b) => states[a].order - states[b].order);

	const currentStateOrder = stateList.indexOf(currentState) + 1;

	return stateList.map((key) => ({
		key,
		completed: currentStateOrder > states[key].order
	}));
}

export default listStates;
