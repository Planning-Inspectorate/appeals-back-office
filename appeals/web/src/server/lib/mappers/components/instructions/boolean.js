import { convertFromBooleanToYesNo } from '#lib/boolean-formatter.js';
import { SHOW_MORE_MAXIMUM_CHARACTERS_BEFORE_HIDING } from '#lib/constants.js';
import { buildHtmSpan } from '#lib/nunjucks-template-builders/tag-builders.js';
import { newLine2LineBreak } from '#lib/string-utilities.js';

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
 * @param {string} [options.actionText]
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
	classes,
	actionText = 'Change'
}) {
	/** @type {ActionItemProperties[]} */
	const actions = [];
	if (editable) {
		actions.push({
			text: actionText,
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
 * @param {boolean} [options.withShowMore]
 * @param {string} [options.showMoreLabelText]
 * @param {boolean} [options.showDetailsWhenAnswerIsNo]
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
	classes,
	withShowMore,
	showMoreLabelText,
	showDetailsWhenAnswerIsNo
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
				value: formatAnswerAndDetails(
					convertFromBooleanToYesNo(value, defaultText),
					valueDetails,
					withShowMore,
					showMoreLabelText || text,
					showDetailsWhenAnswerIsNo
				),
				actions: { items: actions },
				classes
			}
		}
	};
}

/**
 * @param {string|null|undefined} answer
 * @param {string|null|undefined} details
 * @param {boolean} [withShowMore]
 * @param {string} [showMoreLabelText]
 * @param {boolean|null|undefined} [showDetailsWhenAnswerIsNo]
 * @returns {HtmlProperty}
 */
const formatAnswerAndDetails = (
	answer,
	details,
	withShowMore,
	showMoreLabelText,
	showDetailsWhenAnswerIsNo
) => {
	const formattedAnswer = buildHtmSpan(answer || '');

	if (answer === 'Yes' || (answer === 'No' && showDetailsWhenAnswerIsNo)) {
		if (
			withShowMore &&
			typeof details === 'string' &&
			details.length > SHOW_MORE_MAXIMUM_CHARACTERS_BEFORE_HIDING
		) {
			return {
				html: '',
				pageComponents: [
					{
						type: 'html',
						parameters: {
							html: `${formattedAnswer}<br>`
						}
					},
					{
						type: 'show-more',
						parameters: {
							html: newLine2LineBreak(details),
							labelText: showMoreLabelText || ''
						}
					}
				]
			};
		} else {
			return {
				html: `${formattedAnswer}<br>${buildHtmSpan(newLine2LineBreak(details || ''))}`
			};
		}
	} else {
		return {
			html: formattedAnswer
		};
	}
};
