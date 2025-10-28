import { generateS20Components } from './s20.mapper.js';

/**
 * @typedef {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} SingleAppellantCaseResponse
 * @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} Appeal
 */

/**
 *
 * @param {Appeal} appealDetails
 * @param {SingleAppellantCaseResponse} appellantCaseData
 * @param {MappedInstructions} mappedAppellantCaseData
 * @param {boolean} userHasUpdateCasePermission
 * @returns {PageComponent[]}
 */
export function generateEnforcementNoticeComponents(
	appealDetails,
	appellantCaseData,
	mappedAppellantCaseData,
	userHasUpdateCasePermission
) {
	const pageComponents = generateS20Components(
		appealDetails,
		appellantCaseData,
		mappedAppellantCaseData,
		userHasUpdateCasePermission
	);

	const siteDetailsComponentIndex = pageComponents.findIndex(
		(component) =>
			component.type === 'summary-list' && component.parameters.attributes?.id === 'site-details'
	);

	if (siteDetailsComponentIndex !== -1) {
		/**
		 * @type {PageComponent}
		 */
		const appealSiteSummary = {
			type: 'summary-list',
			wrapperHtml: {
				opening: '<div class="govuk-grid-row"><div class="govuk-grid-column-full">',
				closing: '</div></div>'
			},
			parameters: {
				attributes: {
					id: 'site-details'
				},
				card: {
					title: {
						text: '2. Site details'
					}
				},
				rows: [
					mappedAppellantCaseData.siteAddress.display.summaryListItem,
					mappedAppellantCaseData.siteArea.display.summaryListItem,
					mappedAppellantCaseData.inGreenBelt.display.summaryListItem,
					mappedAppellantCaseData.siteOwnership.display.summaryListItem,
					mappedAppellantCaseData.ownersKnown.display.summaryListItem,
					mappedAppellantCaseData.partOfAgriculturalHolding.display.summaryListItem,
					mappedAppellantCaseData.tenantOfAgriculturalHolding.display.summaryListItem,
					mappedAppellantCaseData.otherTenantsOfAgriculturalHolding.display.summaryListItem,
					mappedAppellantCaseData.inspectorAccess.display.summaryListItem,
					mappedAppellantCaseData.healthAndSafetyIssues.display.summaryListItem
				]
			}
		};

		pageComponents[siteDetailsComponentIndex] = appealSiteSummary;
	}

	return pageComponents;
}
