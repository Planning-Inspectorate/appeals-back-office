// File: #lib/mappers/utils/generate-case-summary.js
import { formatCaseOfficerDetailsForCaseSummary } from './format-case-officer-details-for-case-summary.js';

/**
 * Generates the standardized metadata case summary component
 * @param {any} mappedAppealDetails
 * @returns {PageComponent}
 */
export function generateCaseSummary(mappedAppealDetails) {
	const siteAddressItem = mappedAppealDetails.appeal?.siteAddress?.display?.summaryListItem;
	const siteAddressValue = siteAddressItem?.value?.text || siteAddressItem?.value?.html;
	const hasSiteAddress = Boolean(siteAddressValue && siteAddressValue.trim());

	const lpaItem = mappedAppealDetails.appeal?.localPlanningAuthority?.display?.summaryListItem;
	const lpaValue = lpaItem?.value?.text || lpaItem?.value?.html;
	const hasLpa = Boolean(lpaValue && lpaValue.trim());

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
				...(siteAddressItem
					? [
							{
								...siteAddressItem,
								value: hasSiteAddress ? siteAddressItem.value : { text: 'No site address' }
							}
						]
					: []),
				...(lpaItem
					? [
							{
								...lpaItem,
								key: {
									text: 'LPA'
								},
								value: hasLpa ? lpaItem.value : { text: 'No Local planning authority' }
							}
						]
					: [])
			]
		}
	};
}
