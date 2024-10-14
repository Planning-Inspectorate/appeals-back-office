import { isDefined } from '#lib/ts-utilities.js';

/**
 * @param {{appeal: MappedInstructions}} mappedData
 * @returns {PageComponent}
 */
export const getCaseDocumentation = (mappedData) => ({
	type: 'table',
	parameters: {
		head: [{ text: 'Documentation' }, { text: 'Status' }, { text: 'Received' }, { text: 'Action' }],
		rows: [
			mappedData.appeal.appellantCase.display.tableItem,
			mappedData.appeal.lpaQuestionnaire.display.tableItem,
			mappedData.appeal.appealDecision.display.tableItem
		].filter(isDefined),
		firstCellIsHeader: true
	}
});
