import { removeSummaryListActions } from '#lib/mappers/mapper-utilities.js';
import { isDefined } from '#lib/ts-utilities.js';

/**
 * @param {{appeal: MappedInstructions}} mappedData
 * @returns {PageComponent}
 */
export const getCaseOverview = (mappedData) => ({
	type: 'summary-list',
	parameters: {
		rows: [
			mappedData.appeal.appealType.display.summaryListItem,
			removeSummaryListActions(mappedData.appeal?.caseProcedure?.display.summaryListItem),
			mappedData.appeal?.linkedAppeals?.display.summaryListItem,
			mappedData.appeal?.otherAppeals?.display.summaryListItem,
			mappedData.appeal?.allocationDetails?.display.summaryListItem,
			removeSummaryListActions(mappedData.appeal?.lpaReference?.display.summaryListItem),
			mappedData.appeal?.decision?.display.summaryListItem
		].filter(isDefined)
	}
});