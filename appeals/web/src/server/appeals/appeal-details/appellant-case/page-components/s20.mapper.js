import {
	buildAdditionalDocumentsCard,
	buildAppellantDetailsCard,
	buildBeforeYouStartCard,
	buildFullPlanningAppealDetailsCard,
	buildFullPlanningApplicationDetailsCard,
	buildFullPlanningUploadedDocumentsCard,
	buildSummaryListCard
} from './common-sections.mapper.js';

/**
 * @typedef {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} SingleAppellantCaseResponse
 * @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} Appeal
 */

/**
 * Builds the S20 "Site details" section card component.
 * @param {MappedInstructions} mappedAppellantCaseData
 * @returns {PageComponent|null}
 */
export function buildS20SiteDetailsCard(mappedAppellantCaseData) {
	return buildSummaryListCard('site-details', 'Site details', [
		mappedAppellantCaseData.siteAddress?.display?.summaryListItem,
		mappedAppellantCaseData.siteArea?.display?.summaryListItem,
		mappedAppellantCaseData.inGreenBelt?.display?.summaryListItem,
		mappedAppellantCaseData.siteOwnership?.display?.summaryListItem,
		mappedAppellantCaseData.ownersKnown?.display?.summaryListItem,
		mappedAppellantCaseData.inspectorAccess?.display?.summaryListItem,
		mappedAppellantCaseData.healthAndSafetyIssues?.display?.summaryListItem
	]);
}

/**
 *
 * @param {Appeal} appealDetails
 * @param {SingleAppellantCaseResponse} appellantCaseData
 * @param {MappedInstructions} mappedAppellantCaseData
 * @param {boolean} userHasUpdateCasePermission
 * @returns {(PageComponent|null)[]}
 */
export function generateS20Components(
	appealDetails,
	appellantCaseData,
	mappedAppellantCaseData,
	userHasUpdateCasePermission
) {
	const components = [
		buildBeforeYouStartCard(mappedAppellantCaseData),
		buildAppellantDetailsCard(appealDetails, mappedAppellantCaseData),
		buildS20SiteDetailsCard(mappedAppellantCaseData),
		buildFullPlanningApplicationDetailsCard(mappedAppellantCaseData),
		buildFullPlanningAppealDetailsCard(mappedAppellantCaseData),
		buildFullPlanningUploadedDocumentsCard(mappedAppellantCaseData),
		buildAdditionalDocumentsCard(
			appellantCaseData,
			mappedAppellantCaseData,
			userHasUpdateCasePermission
		)
	];

	return components.filter(Boolean);
}
