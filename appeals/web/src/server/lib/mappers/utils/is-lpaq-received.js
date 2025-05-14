import { DOCUMENT_STATUS_NOT_RECEIVED } from '@pins/appeals/constants/support.js';

/**
 * @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} WebAppeal
 */

/**
 * @param {WebAppeal} appealDetails
 * @returns {boolean}
 */
export const isLpaqReceived = (appealDetails) => {
	const { status } = appealDetails.documentationSummary?.lpaQuestionnaire || {};
	return !(status === DOCUMENT_STATUS_NOT_RECEIVED || !status);
};
