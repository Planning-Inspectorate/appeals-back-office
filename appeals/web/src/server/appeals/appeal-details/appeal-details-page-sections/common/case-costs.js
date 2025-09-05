import { isDefined } from '#lib/ts-utilities.js';

/**
 * @param {{appeal: MappedInstructions}} mappedData
 * @returns {PageComponent}
 */
export const getCaseCosts = (mappedData) => ({
	type: 'table',
	parameters: {
		head: [
			{ text: 'Documentation' },
			{ text: 'Status' },
			{ text: 'Action', classes: 'govuk-!-text-align-right' }
		],
		rows: [
			mappedData.appeal.costsAppellantApplication.display.tableItem,
			mappedData.appeal.costsAppellantWithdrawal.display.tableItem,
			mappedData.appeal.costsAppellantCorrespondence.display.tableItem,
			mappedData.appeal.costsLpaApplication.display.tableItem,
			mappedData.appeal.costsLpaWithdrawal.display.tableItem,
			mappedData.appeal.costsLpaCorrespondence.display.tableItem
		].filter(isDefined),
		firstCellIsHeader: true
	},
	wrapperHtml: {
		opening: '<h1 class="govuk-heading-l">Costs</h1>',
		closing: ''
	}
});
