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
			{
				...mappedData.appeal.lpaContactDetails.display.summaryListItem,
				key: {
					text: 'LPA'
				}
			},
			mappedData.appeal.rule6PartyContactDetails?.display?.summaryListItem
		].filter(isDefined)
	},
	wrapperHtml: {
		opening: '<h2 class="govuk-heading-l">Contacts</h2>',
		closing: ''
	}
});
