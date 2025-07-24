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
			removeSummaryListActions(mappedData.appeal?.lpaReference?.display.summaryListItem),
			mappedData.appeal.appealType.display.summaryListItem,
			removeSummaryListActions(mappedData.appeal?.caseProcedure?.display.summaryListItem),
			mappedData.appeal?.allocationDetails?.display.summaryListItem,
			mappedData.appeal?.linkedAppeals?.display.summaryListItem,
			mappedData.appeal?.otherAppeals?.display.summaryListItem,
			mappedData.appeal?.netResidenceChange?.display.summaryListItem,
			mappedData.appeal?.netResidenceGainOrLoss?.display.summaryListItem,
			mappedData.appeal?.decision?.display.summaryListItem,
			mappedData.appeal?.costsAppellantDecision?.display.summaryListItem,
			mappedData.appeal?.costsLpaDecision?.display.summaryListItem
		].filter(isDefined)
	}
});
