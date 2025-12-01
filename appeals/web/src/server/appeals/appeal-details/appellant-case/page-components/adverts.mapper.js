/**
 * @typedef {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} SingleAppellantCaseResponse
 * @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} Appeal
 */

import { generateCASAdvertComponents } from './cas-advert.mapper.js';

/**
 *
 * @param {Appeal} appealDetails
 * @param {SingleAppellantCaseResponse} appellantCaseData
 * @param {MappedInstructions} mappedAppellantCaseData
 * @param {boolean} userHasUpdateCasePermission
 * @returns {PageComponent[]}
 */
export function generateAdvertComponents(
	appealDetails,
	appellantCaseData,
	mappedAppellantCaseData,
	userHasUpdateCasePermission
) {
	const pageComponents = generateCASAdvertComponents(
		appealDetails,
		appellantCaseData,
		mappedAppellantCaseData,
		userHasUpdateCasePermission
	);

	/**
	 * @type {PageComponent}
	 */
	const appealSummary = {
		type: 'summary-list',
		wrapperHtml: {
			opening: '<div class="govuk-grid-row"><div class="govuk-grid-column-full">',
			closing: '</div></div>'
		},
		parameters: {
			attributes: {
				id: 'appeal-summary'
			},
			card: {
				title: {
					text: 'Appeal details'
				}
			},
			rows: [
				mappedAppellantCaseData.procedurePreference.display.summaryListItem,
				mappedAppellantCaseData.procedurePreferenceDetails.display.summaryListItem,
				mappedAppellantCaseData.procedurePreferenceDuration.display.summaryListItem,
				mappedAppellantCaseData.inquiryNumberOfWitnesses.display.summaryListItem
			]
		}
	};
	const beforeToLastPosition = pageComponents.length - 1;
	pageComponents.splice(beforeToLastPosition, 0, appealSummary);

	pageComponents[pageComponents.length - 1].parameters.card.title.text = 'Upload documents';

	return pageComponents;
}
