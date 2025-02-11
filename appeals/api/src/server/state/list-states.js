import createStateMachine from './create-state-machine.js';

/** @typedef {import('#db-client').AppealType} AppealType */
/** @typedef {import('@pins/appeals.api').Appeals.StateStub} StateStub */

/**
 * @param {AppealType} appealType
 * @param {string} currentState
 * @returns {StateStub[]}
 * */
function listStates(appealType, currentState) {
	const stateMachine = createStateMachine(appealType?.key, currentState);
	const { states } = stateMachine;

	const stateList = Object.keys(states).sort((a, b) => states[a].order - states[b].order);
	const currentStateOrder = stateList.indexOf(currentState) + 1;

	return stateList.map((key) => ({
		key,
		completed: currentStateOrder > states[key].order
	}));
}

export default listStates;
