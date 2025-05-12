import { DOCUMENT_STATUS_RECEIVED } from '@pins/appeals/constants/support.js';

/**
 * @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} WebAppeal
 */

/**
 * @param {WebAppeal} appealDetails
 * @returns {boolean}
 */
export const isLpaqReceived = (appealDetails) =>
	appealDetails.documentationSummary?.lpaQuestionnaire?.status === DOCUMENT_STATUS_RECEIVED;
