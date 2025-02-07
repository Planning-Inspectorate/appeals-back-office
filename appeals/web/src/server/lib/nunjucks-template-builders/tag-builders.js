/**
 * @typedef {'text' | 'link' | 'unorderedList'} HtmlTagType
 */

/**
 * @typedef HtmlLink
 * @type {object}
 * @property {string} title
 * @property {string} href
 * @property {string} [target]
 */

/**
 * @param {Array<string|string[]>|undefined} items
 * @param {number} [recursionDepth]
 * @param {string} listClasses
 * @returns {string}
 */
export const buildHtmUnorderedList = (
	items,
	recursionDepth = 0,
	listClasses = 'govuk-list govuk-!-margin-top-0 govuk-!-padding-left-0'
) => {
	if (!items?.length) {
		return '';
	}
	const listItems = items
		.map(
			(item) =>
				`<li>${Array.isArray(item) ? buildHtmUnorderedList(item, recursionDepth + 1) : item}</li>`
		)
		.join('');
	return `<ul class="${recursionDepth === 0 ? listClasses : ''}">${listItems}</ul>`;
};

/**
 * @param {string} text
 * @returns {string}
 */
export const buildHtmSpan = (text) => {
	return `<span>${text}</span>`;
};
