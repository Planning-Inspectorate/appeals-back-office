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
		].filter((row) => row);
	}

	if (mappedAppellantCaseData.otherAppellants.display.summaryListItem) {
		getComponentParameters('appellant-details', pageComponents)?.parameters.rows.push(
			mappedAppellantCaseData.otherAppellants.display.summaryListItem
		);
	}

	const appealSiteAddressComponents = getComponentParameters('site-details', pageComponents);
	if (appealSiteAddressComponents) {
		appealSiteAddressComponents.parameters.card.title.text = 'Land';
		appealSiteAddressComponents.parameters.rows = [
			mappedAppellantCaseData.siteAddress.display.summaryListItem,
			mappedAppellantCaseData.contactAddress.display.summaryListItem,
			mappedAppellantCaseData.interestInLand.display.summaryListItem,
			mappedAppellantCaseData.writtenOrVerbalPermission.display.summaryListItem,
			mappedAppellantCaseData.inspectorAccess.display.summaryListItem,
			mappedAppellantCaseData.healthAndSafetyIssues.display.summaryListItem
		].filter((row) => row);
	}

	return pageComponents;
}
