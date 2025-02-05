/**
 * @param {Object} options
 * @param {string} options.id
 * @param {string} options.text
 * @param {string[]} options.value
 * @param {string} options.link
 * @param {boolean} options.editable
 * @param {string} [options.classes]
 * @param {boolean} [options.returnPlainTextForSingleItem]
 * @returns {Instructions}
 */
export function listSummaryListItem({
	id,
	text,
	value,
	link,
	editable,
	classes,
	returnPlainTextForSingleItem = true
}) {
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
					html:
						returnPlainTextForSingleItem && value.length === 1
							? value[0]
							: `<ul class="pins-summary-list-sublist">${value
									.map((item) => `<li>${item}</li>`)
									.join('')}</ul>`
				},
				actions: { items: actions },
				classes
			}
		}
	};
}
