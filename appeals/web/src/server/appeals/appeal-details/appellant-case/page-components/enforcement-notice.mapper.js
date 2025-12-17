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

	const applicationDetailsComponents = getComponentParameters(
		'application-summary',
		pageComponents
	);
	if (applicationDetailsComponents) {
		applicationDetailsComponents.parameters.rows = [
			mappedAppellantCaseData.relatedAppeals.display.summaryListItem
		].filter((row) => row);
	}

	/**
	 *
	 * @param {Instructions[]} subMapperList
	 * @returns {SummaryListRowProperties[]}
	 */
	const getSummaryListItems = (subMapperList) =>
		// @ts-ignore
		subMapperList?.map((subMapper) => subMapper.display.summaryListItem);

	/**
	 * @type {PageComponent}
	 */
	const groundsAndFactsSummary = {
		type: 'summary-list',
		wrapperHtml: {
			opening: '<div class="govuk-grid-row"><div class="govuk-grid-column-full">',
			closing: '</div></div>'
		},
		parameters: {
			attributes: {
				id: 'grounds-and-facts'
			},
			card: {
				title: {
					text: 'Grounds and facts'
				}
			},
			rows: [
				mappedAppellantCaseData.descriptionOfAllegedBreach.display.summaryListItem,
				mappedAppellantCaseData.groundsForAppeal.display.summaryListItem,
				// @ts-ignore
				...getSummaryListItems(mappedAppellantCaseData.factsForGrounds),
				// @ts-ignore
				...getSummaryListItems(mappedAppellantCaseData.supportingDocumentsForGrounds),
				mappedAppellantCaseData.applicationReceipt.display.summaryListItem,
				mappedAppellantCaseData.applicationDevelopmentAllOrPart.display.summaryListItem,
				mappedAppellantCaseData.applicationReference.display.summaryListItem,
				mappedAppellantCaseData.applicationDate.display.summaryListItem,
				mappedAppellantCaseData.developmentDescription.display.summaryListItem,
				mappedAppellantCaseData.applicationDecision.display.summaryListItem,
				mappedAppellantCaseData.applicationDecisionDate.display.summaryListItem
			].filter((row) => row)
		}
	};

	const insertIndex =
		pageComponents.findIndex(
			(component) => component.parameters.attributes?.id === 'site-details'
		) + 1;

	return pageComponents
		.slice(0, insertIndex)
		.concat(groundsAndFactsSummary)
		.concat(pageComponents.slice(insertIndex));
}
