// File: #lib/mappers/utils/generate-case-summary.js
import { formatCaseOfficerDetailsForCaseSummary } from './format-case-officer-details-for-case-summary.js';

/**
 * Generates the standardized metadata case summary component
 * @param {any} mappedAppealDetails
 * @returns {PageComponent}
 */
export function generateCaseSummary(mappedAppealDetails) {
	return {
		type: 'summary-list',
		wrapperHtml: {
			opening: '<div class="govuk-grid-row"><div class="govuk-grid-column-full">',
			closing: '</div></div>'
		},
		parameters: {
			classes: 'pins-summary-list--no-border',
			rows: [
				...(mappedAppealDetails.appeal?.caseOfficer?.display?.summaryListItem
					? [
							formatCaseOfficerDetailsForCaseSummary(
								mappedAppealDetails.appeal.caseOfficer.display.summaryListItem
							)
						]
					: []),
				...(mappedAppealDetails.appeal?.siteAddress?.display?.summaryListItem
					? [mappedAppealDetails.appeal.siteAddress.display.summaryListItem]
					: []),
				...(mappedAppealDetails.appeal?.localPlanningAuthority?.display?.summaryListItem
					? [
							{
								...mappedAppealDetails.appeal.localPlanningAuthority.display.summaryListItem,
								key: {
									text: 'LPA'
								}
							}
						]
					: [])
			]
		}
	};
}
