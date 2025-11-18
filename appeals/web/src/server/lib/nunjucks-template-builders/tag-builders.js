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
 * @param {Object} params
 * @param {(string|string[])[]} [params.items]
 * @param {number} [params.recursionDepth]
 * @param {string} [params.listClasses]
 * @param {boolean} [params.isOrderedList]
 * @param {boolean} [params.isNumberedList]
 * @returns {string}
 */
export const buildHtmlList = ({
	items = [],
	recursionDepth = 0,
	listClasses = 'govuk-list govuk-!-margin-top-0 govuk-!-padding-left-0',
	isOrderedList = false,
	isNumberedList = false
}) => {
	if (!items?.length) {
		return '';
	}
	if (items.length === 1) {
		const item = items[0];
		return Array.isArray(item)
			? buildHtmlList({ items: item, recursionDepth: recursionDepth + 1 })
			: item;
	}
	const listTag = isOrderedList ? 'ol' : 'ul';
	const listItems = items
		.map(
			(item) =>
				`<li>${
					Array.isArray(item)
						? buildHtmlList({ items: item, recursionDepth: recursionDepth + 1 })
						: item
				}</li>`
		)
		.join('');
	return `<${listTag} class="${
		recursionDepth === 0 ? `${listClasses}${isNumberedList ? ' govuk-list--number' : ''}` : ''
	}">${listItems}</${listTag}>`;
};

/**
 * @param {string} text
 * @returns {string}
 */
export const buildHtmSpan = (text) => {
	return `<span>${text}</span>`;
};
