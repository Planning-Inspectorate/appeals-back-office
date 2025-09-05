import {
	buildRejectionReasons,
	rejectionReasonHtml
} from '#appeals/appeal-details/representations/common/components/reject-reasons.js';

/**
 * @typedef {import('@pins/appeals.api').Appeals.ReasonOption} ReasonOption
 */

/**
 *
 * @param {ReasonOption[]} reasonOptions
 * @param {string|string[]|undefined} reasons
 * @param {Object<string, string[]>|undefined} reasonsText
 * @returns {string} string containing unordered list html
 */
export function mapReasonsToReasonsListHtml(reasonOptions, reasons, reasonsText) {
	if (!reasons || reasons.length === 0) {
		return '';
	}

	const items = buildRejectionReasons(reasonOptions, reasons, reasonsText);

	return rejectionReasonHtml(items);
}
