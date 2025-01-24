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
