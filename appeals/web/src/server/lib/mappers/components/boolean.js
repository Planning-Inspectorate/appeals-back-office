import { convertFromBooleanToYesNo } from '#lib/boolean-formatter.js';
import { buildHtmSpan } from '#lib/nunjucks-template-builders/tag-builders.js';

/**
 *
 * @param {Object} options
 * @param {string} options.id
 * @param {string} options.text
 * @param {boolean|null} [options.value]
 * @param {string} [options.defaultText]
 * @param {string} options.link
 * @param {boolean} [options.addCyAttribute]
 * @param {boolean} options.editable
 * @param {string} [options.classes]
 * @returns {Instructions}
 */
export function booleanSummaryListItem({
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
					text: convertFromBooleanToYesNo(value, defaultText)
				},
				actions: { items: actions },
				classes
			}
		}
	};
}

/**
 *
 * @param {Object} options
 * @param {string} options.id
 * @param {string} options.text
 * @param {boolean|null} [options.value]
 * @param {string|null} [options.valueDetails]
 * @param {string} [options.defaultText]
 * @param {string} options.link
 * @param {boolean} [options.addCyAttribute]
 * @param {boolean} options.editable
 * @param {string} [options.classes]
 * @returns {Instructions}
 */
export function booleanWithDetailsSummaryListItem({
	id,
	text,
	value,
	valueDetails,
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
					html: formatAnswerAndDetails(convertFromBooleanToYesNo(value, defaultText), valueDetails)
				},
				actions: { items: actions },
				classes
			}
		}
	};
}

/**
 * @param {string|null|undefined} answer
 * @param {string|null|undefined} details
 * @returns {string}
 */
const formatAnswerAndDetails = (answer, details) => {
	let formatted = buildHtmSpan(answer || '');
	if (answer === 'Yes') {
		formatted += `<br>${buildHtmSpan(details || '')}`;
	}
	return formatted;
};
