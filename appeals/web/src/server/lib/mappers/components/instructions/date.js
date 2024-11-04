import { dateISOStringToDisplayDate } from '#lib/dates.js';

/**
 *
 * @param {Object} options
 * @param {string} options.id
 * @param {string} options.text
 * @param {string|null} [options.value]
 * @param {string} [options.defaultText]
 * @param {string} options.link
 * @param {boolean} [options.addCyAttribute]
 * @param {boolean} options.editable
 * @param {string} [options.classes]
 * @returns {Instructions}
 */
export function dateSummaryListItem({
	id,
	text,
	value,
	defaultText,
	link,
	addCyAttribute,
	editable,
	classes
}) {
	/** @type {ActionItemProperties[]} */
	const actions = [];
	if (editable) {
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
					text: value ? dateISOStringToDisplayDate(value) : defaultText
				},
				actions: { items: actions },
				classes
			}
		}
	};
}
