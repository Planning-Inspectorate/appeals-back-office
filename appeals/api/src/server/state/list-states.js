import { APPEAL_TYPE_SHORTHAND_HAS } from '#endpoints/constants.js';
import createStateMachine from './create-state-machine.js';

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
	const stateMachine = createStateMachine(appealType.key, procedureType?.key, currentState);
	const { states } = stateMachine;

	if (!procedureType && appealType.key !== APPEAL_TYPE_SHORTHAND_HAS) {
		throw new Error(`Procedure type is required to list states for appeal type: ${appealType.key}`);
	}

	const stateList = Object.keys(states)
		.filter((key) => {
			const state = states[key];
			const { validAppealTypes, validProcedureTypes } = state.meta;

			if (!procedureType) {
				return validAppealTypes.includes(appealType.key);
			}

			return (
				validAppealTypes.includes(appealType.key) && validProcedureTypes.includes(procedureType.key)
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
