import { SHOW_MORE_MAXIMUM_CHARACTERS_BEFORE_HIDING } from '#lib/constants.js';

/**
 * Returns the instructions for a text display field
 *
 * @param {Object} options
 * @param {string} options.id
 * @param {string} options.text
 * @param {string|{html: string}|null} [options.value]
 * @param {string} options.link
 * @param {boolean} options.userHasEditPermission
 * @param {boolean} [options.withShowMore]
 * @param {string} [options.classes]
 * @param {string} [options.cypressDataName]
 * @returns {Instructions}
 */
export function textDisplayField({
	id,
	text,
	value,
	link,
	userHasEditPermission,
	withShowMore,
	classes,
	cypressDataName = 'change-' + id
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
						labelText: text
					}
				}
			]
		};
	}
	/** @type {ActionItemProperties[]} */
	const actions = [];
	if (userHasEditPermission) {
		actions.push({
			text: 'Change',
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
