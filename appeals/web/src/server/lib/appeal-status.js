import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';

/** @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} WebAppeal */

/**
 * @param {string} appealStatus
 * @param {string} appealType
 * @returns {string}
 * */
export function mapStatusText(appealStatus, appealType) {
	if (![APPEAL_TYPE.D, APPEAL_TYPE.W].includes(appealType)) {
		return appealStatus;
	}

	switch (appealStatus) {
		case 'event':
			return 'site visit ready to set up';
		case 'awaiting_event':
			return 'awaiting site visit';
		default:
			return appealStatus;
	}
}

/**
 * Returns true if the given state was previously passed through.
 *
 * @param {WebAppeal} appeal
 * @param {string} state
 * @returns {boolean}
 * */
export function isStatePassed(appeal, state) {
	const { stateList } = appeal;

	if (!stateList) {
		return false;
	}

	const propState = stateList.find((s) => s.key === state);
	if (!propState) {
		return false;
	}

	return propState.completed;
}
