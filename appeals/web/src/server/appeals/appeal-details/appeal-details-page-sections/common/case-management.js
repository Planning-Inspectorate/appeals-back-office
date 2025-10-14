import { isDefined } from '#lib/ts-utilities.js';

/**
 * @param {{appeal: MappedInstructions}} mappedData
 * @returns {PageComponent}
 */
export const getCaseManagement = (mappedData) => ({
	type: 'summary-list',
	parameters: {
		rows: [
			mappedData.appeal.crossTeamCorrespondence.display.summaryListItem,
			mappedData.appeal.inspectorCorrespondence.display.summaryListItem,
			mappedData.appeal.mainPartyCorrespondence.display.summaryListItem,
			mappedData.appeal.caseHistory.display.summaryListItem,
			mappedData.appeal.appealWithdrawal.display.summaryListItem
		].filter(isDefined)
	},
	wrapperHtml: {
		opening: '<h1 class="govuk-heading-l">Case management</h1>',
		closing: '',
		id: 'case-management'
	}
});
