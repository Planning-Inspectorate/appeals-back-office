import { removeSummaryListActions } from '#lib/mappers/index.js';
import { isDefined } from '#lib/ts-utilities.js';

/**
 * @param {{appeal: MappedInstructions}} mappedData
 * @returns {PageComponent}
 */
export const getCaseContacts = (mappedData) => ({
	type: 'summary-list',
	parameters: {
		rows: [
			mappedData.appeal.appellant.display.summaryListItem,
			mappedData.appeal.agent.display.summaryListItem,
			removeSummaryListActions({
				...mappedData.appeal.lpaContactDetails.display.summaryListItem,
				key: {
					text: 'LPA'
				}
			})
		].filter(isDefined)
	}
});
