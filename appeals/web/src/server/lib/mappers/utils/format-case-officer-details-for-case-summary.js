/**
 * Remove email address from Case Officer details if they exist and generate unique data-cy attribute
 * @param {SummaryListRowProperties} caseOfficerDetails
 * @returns {SummaryListRowProperties}
 */
export function formatCaseOfficerDetailsForCaseSummary(caseOfficerDetails) {
	const formattedHtml =
		caseOfficerDetails.value.html.split('<li>').length > 1
			? caseOfficerDetails.value.html.split('</li>')[0].split('<li>')[1] || ''
			: caseOfficerDetails.value.html;

	const formattedActionItems = caseOfficerDetails.actions.items.map(
		(/** @type {ActionItemProperties} */ item) => ({
			...item,
			attributes: item.attributes
				? {
						...item.attributes,
						['data-cy']: Object.prototype.hasOwnProperty.call(item.attributes, 'data-cy')
							? item.attributes['data-cy'] + '-name'
							: ''
				  }
				: {}
		})
	);

	return {
		...caseOfficerDetails,
		value: {
			html: formattedHtml
		},
		actions: {
			...caseOfficerDetails.actions,
			items: formattedActionItems
		}
	};
}
