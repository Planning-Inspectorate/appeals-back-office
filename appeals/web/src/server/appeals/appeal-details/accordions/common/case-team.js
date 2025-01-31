import { isDefined } from '#lib/ts-utilities.js';

/**
 * @param {{appeal: MappedInstructions}} mappedData
 * @returns {PageComponent}
 */
export const getCaseTeam = (mappedData) => ({
	type: 'summary-list',
	parameters: {
		rows: [
			mappedData.appeal.caseOfficer.display.summaryListItem,
			mappedData.appeal.inspector.display.summaryListItem
		].filter(isDefined)
	}
});
