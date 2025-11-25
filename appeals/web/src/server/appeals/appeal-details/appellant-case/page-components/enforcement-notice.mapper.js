import { generateS20Components } from './s20.mapper.js';

/**
 * @typedef {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} SingleAppellantCaseResponse
 * @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} Appeal
 */

// @ts-ignore
const getComponentParameters = (componentId, sectionComponents = []) =>
	sectionComponents.find(
		(component) =>
			component.type === 'summary-list' && component.parameters.attributes?.id === componentId
	);

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

	const beforeYouStartComponents = getComponentParameters('before-you-start', pageComponents);
	if (beforeYouStartComponents) {
		beforeYouStartComponents.parameters.rows = [
			mappedAppellantCaseData.enforcementNotice.display.summaryListItem,
			mappedAppellantCaseData.localPlanningAuthority.display.summaryListItem,
			mappedAppellantCaseData.enforcementNoticeListedBuilding.display.summaryListItem,
			mappedAppellantCaseData.enforcementIssueDate.display.summaryListItem,
			mappedAppellantCaseData.enforcementEffectiveDate.display.summaryListItem,
			mappedAppellantCaseData.contactPlanningInspectorateDate.display.summaryListItem,
			mappedAppellantCaseData.enforcementReference.display.summaryListItem
		];
	}

	getComponentParameters('appellant-details', pageComponents)?.parameters.rows.push(
		mappedAppellantCaseData.otherAppellants.display.summaryListItem
	);

	const appealSiteAddressComponents = getComponentParameters('site-details', pageComponents);
	if (appealSiteAddressComponents) {
		appealSiteAddressComponents.parameters.rows = [
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
		];
	}

	return pageComponents;
}
