import { SHOW_MORE_MAXIMUM_CHARACTERS_BEFORE_HIDING } from '#lib/constants.js';

/**
 * Returns the instructions for a text display field
 *
 * @param {Object} options
 * @param {string} options.id
 * @param {string} options.text
 * @param {string|HtmlProperty|null} [options.value]
 * @param {string} options.link
 * @param {boolean} options.editable
 * @param {boolean} [options.withShowMore]
 * @param {string} [options.showMoreLabelText]
 * @param {string} [options.classes]
 * @param {string} [options.actionText]
 * @param {string} [options.cypressDataName]
 * @returns {Instructions}
 */
export function textSummaryListItem({
	id,
	text,
	value,
	link,
	editable,
	withShowMore,
	showMoreLabelText,
	classes,
	actionText = 'Change',
	cypressDataName = actionText.toLowerCase() + '-' + id
}) {
	/** @type {TextProperty & ClassesProperty | HtmlProperty & ClassesProperty} */
	let displayValue = { text: value };
	// support passing HTML in
	if (typeof value === 'object' && value !== null && 'html' in value) {
		displayValue = value;
	}
	// support 'show more' for large text fields
	if (
		withShowMore &&
		typeof value === 'string' &&
		value?.length > SHOW_MORE_MAXIMUM_CHARACTERS_BEFORE_HIDING
	) {
		displayValue = {
			html: '',
			pageComponents: [
				{
					type: 'show-more',
					parameters: {
						text: value,
						labelText: showMoreLabelText || text
					}
				}
			]
		};
	}
	/** @type {ActionItemProperties[]} */
	const actions = [];
	if (editable) {
		actions.push({
			text: actionText,
			visuallyHiddenText: text,
			href: link,
			attributes: { 'data-cy': cypressDataName }
		});
	}
	return {
		id,
		display: {
			summaryListItem: {
				key: { text },
				value: displayValue,
				actions: { items: actions },
				classes
			}
		}
	};
}
