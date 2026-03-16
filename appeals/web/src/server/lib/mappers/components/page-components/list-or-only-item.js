/**
 * Returns an unordered list of items if there are many, or just the first item if
 * there is only one, or the fallback text if there are no items
 * @param {string[]} items
 * @param {string} [fallbackText]
 * @param {string} [additionalListClasses]
 * @returns {string}
 */
export const listOrOnlyItem = (
	items,
	fallbackText = 'None',
	additionalListClasses = 'govuk-list--bullet'
) => {
	if (!items || items.length === 0) {
		return fallbackText;
	}
	if (items.length === 1) {
		return items[0];
	} else {
		return `<ul class="govuk-list${additionalListClasses ? ` ${additionalListClasses}` : ''}"><li>${items.join('</li><li>')}</li></ul>`;
	}
};
