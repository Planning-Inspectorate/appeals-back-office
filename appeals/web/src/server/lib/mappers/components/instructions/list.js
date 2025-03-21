/**
 * @param {Object} options
 * @param {string} options.id
 * @param {string} options.text
 * @param {string[]} options.value
 * @param {string} options.link
 * @param {boolean} options.editable
 * @param {string} [options.classes]
 * @param {string} [options.prefaceText]
 * @returns {Instructions}
 */
export function listSummaryListItem({ id, text, value, link, editable, classes, prefaceText }) {
	/** @type {ActionItemProperties[]} */
	const actions = [];
	if (editable) {
		actions.push({
			text: 'Change',
			visuallyHiddenText: text,
			href: link,
			attributes: { 'data-cy': 'change-' + id }
		});
	}

	return {
		id,
		display: {
			summaryListItem: {
				key: { text },
				value: {
					html: `${
						prefaceText ? prefaceText + '\n' : ''
					}<ul class="pins-summary-list-sublist">${value
						.map((item) => `<li>${item}</li>`)
						.join('')}</ul>`
				},
				actions: { items: actions },
				classes
			}
		}
	};
}
