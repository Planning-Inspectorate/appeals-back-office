/**
 * Remove email address from Case Officer details if they exist
 * @param {SummaryListRowProperties} caseOfficerDetails
 * @returns {SummaryListRowProperties}
 */
export function formatCaseOfficerDetailsForCaseSummary(caseOfficerDetails) {
	const formattedHtml =
		caseOfficerDetails.value.html.split('<li>').length > 1
			? caseOfficerDetails.value.html.split('</li>')[0].split('<li>')[1] || ''
			: caseOfficerDetails.value.html;
	return {
		...caseOfficerDetails,
		value: {
			html: formattedHtml
		}
	};
}
