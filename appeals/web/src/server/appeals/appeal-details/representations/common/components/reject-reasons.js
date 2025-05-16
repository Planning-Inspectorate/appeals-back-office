import { ensureArray } from '#lib/array-utilities.js';
import { buildHtmlList } from '#lib/nunjucks-template-builders/tag-builders.js';

/**
 * @typedef {import('@pins/appeals.api').Appeals.ReasonOption} ReasonOption
 */

/**
 * @param {Object} rejectComment
 * @param {string|string[]} reasons
 * @param {ReasonOption[]} reasonOptions
 * @returns {string[]}
 * */
export const prepareRejectionReasons = (rejectComment, reasons, reasonOptions) => {
	const reasonsText = reasonOptions.reduce((acc, { id, hasText }) => {
		if (!hasText) {
			return acc;
		}
		// @ts-ignore
		const otherReasons = rejectComment[`rejectionReason-${id}`];
		if (otherReasons) {
			return { ...acc, [id]: otherReasons };
		}
		return acc;
	}, {});

	return buildRejectionReasons(reasonOptions, reasons, reasonsText);
};

/**
 * @param {ReasonOption[]} reasonOptions
 * @param {string|string[]} reasons
 * @param {Object<string, string[]>|undefined} reasonsText
 * @returns {string[]}
 * */
export const buildRejectionReasons = (reasonOptions, reasons, reasonsText) => {
	const selectedReasons = ensureArray(reasons)
		.filter((reason) => !!reason)
		.map((reason) => parseInt(reason, 10));
	return reasonOptions.reduce((/** @type {string[]} */ acc, reason) => {
		const { id, name, hasText } = reason;
		if (!selectedReasons.includes(id)) {
			return acc;
		}
		const otherReasons = hasText ? ensureArray(reasonsText && reasonsText[id]) : [];
		if (otherReasons?.length) {
			return [
				...acc,
				...otherReasons
					.filter((otherReason) => otherReason?.trim()) // Remove empty other reasons
					.map((otherReason) => `${name}: ${otherReason}`)
			];
		} else {
			return [...acc, name];
		}
	}, []);
};

/**
 *
 * @param {(string | string[])[]|undefined} reasons
 * @returns {string}
 */
export const rejectionReasonHtml = (reasons) => {
	return buildHtmlList({
		...(reasons ? { items: reasons } : {}),
		listClasses: 'govuk-list govuk-!-margin-top-0 govuk-!-margin-bottom-0 govuk-list--bullet'
	});
};
