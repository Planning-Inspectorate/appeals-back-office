import { isDefined } from '#lib/ts-utilities.js';

/**
 * @param {{appeal: MappedInstructions}} mappedData
 * @returns {PageComponent}
 */
export const getSiteDetails = (mappedData) => ({
	type: 'summary-list',
	parameters: {
		rows: [
			mappedData.appeal.lpaInspectorAccess.display.summaryListItem,
			mappedData.appeal.appellantInspectorAccess.display.summaryListItem,
			mappedData.appeal.lpaNeighbouringSites.display.summaryListItem,
			mappedData.appeal.inspectorNeighbouringSites.display.summaryListItem,
			mappedData.appeal.lpaHealthAndSafety.display.summaryListItem,
			mappedData.appeal.appellantHealthAndSafety.display.summaryListItem,
			mappedData.appeal.visitType.display.summaryListItem
		].filter(isDefined)
	}
});
