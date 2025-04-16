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
			mappedData.appeal.costsDecision.display.tableItem
		].filter(isDefined),
		firstCellIsHeader: true
	}
});
