import { buildHtmUnorderedList } from '#lib/nunjucks-template-builders/tag-builders.js';

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

	if (!Array.isArray(reasons)) {
		reasons = [reasons];
	}

	const items = reasons
		?.map((reason) => reasonOptions.find((option) => option.id === parseInt(reason || '', 10)))
		.map((option) => {
			if (!option) {
				throw new Error('invalid or incomplete reason ID was not recognised');
			}

			/** @type {string[]} */
			let textItems = [];

			if (option.hasText && reasonsText && reasonsText[option.id]) {
				textItems = reasonsText[option.id];
			}

			/** @type {Array<string|string[]>} */
			const list = [`${option.name}${textItems.length ? ':' : ''}`];

			if (textItems.length) {
				list.push(textItems);
			}

			return list;
		})
		.flat() || [''];

	return buildHtmUnorderedList(items);
}
