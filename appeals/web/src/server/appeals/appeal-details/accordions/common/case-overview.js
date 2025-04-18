import { removeSummaryListActions } from '#lib/mappers/index.js';
import { isDefined } from '#lib/ts-utilities.js';

/**
 * @param {{appeal: MappedInstructions}} mappedData
 * @returns {PageComponent}
 */
export const getCaseOverview = (mappedData) => ({
	type: 'summary-list',
	parameters: {
		rows: [
			mappedData.appeal.siteAddress.display.summaryListItem,
			mappedData.appeal.localPlanningAuthority.display.summaryListItem,
			removeSummaryListActions(mappedData.appeal?.lpaReference?.display.summaryListItem),
			mappedData.appeal.appealType.display.summaryListItem,
			removeSummaryListActions(mappedData.appeal?.caseProcedure?.display.summaryListItem),
			mappedData.appeal?.allocationDetails?.display.summaryListItem,
			mappedData.appeal?.linkedAppeals?.display.summaryListItem,
			mappedData.appeal?.otherAppeals?.display.summaryListItem,
			mappedData.appeal?.decision?.display.summaryListItem
		].filter(isDefined)
	}
});
