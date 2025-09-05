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
			}
		].filter(isDefined)
	},
	wrapperHtml: {
		opening: '<h1 class="govuk-heading-l">Contacts</h1>',
		closing: ''
	}
});
