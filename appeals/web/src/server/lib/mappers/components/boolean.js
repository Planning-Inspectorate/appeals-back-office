import { convertFromBooleanToYesNo } from '#lib/boolean-formatter.js';

/**
 *
 * @param {Object} options
 * @param {string} options.id
 * @param {string} options.text
 * @param {boolean|null} [options.value]
 * @param {string} [options.defaultText]
 * @param {string} options.link
 * @param {boolean} [options.addCyAttribute]
 * @param {boolean} options.userHasEditPermission
 * @returns {Instructions}
 */
export function booleanSummaryListItem({
	id,
	text,
	value,
	defaultText,
	link,
	addCyAttribute,
	userHasEditPermission
}) {
	/** @type {ActionItemProperties[]} */
	const actions = [];
	if (userHasEditPermission) {
		actions.push({
			text: 'Change',
			visuallyHiddenText: text,
			href: link,
			attributes: addCyAttribute && { 'data-cy': 'change-' + id }
		});
	}
	return {
		id,
		display: {
			summaryListItem: {
				key: { text },
				value: {
					text: convertFromBooleanToYesNo(value, defaultText)
				},
				actions: { items: actions }
			}
		}
	};
}
