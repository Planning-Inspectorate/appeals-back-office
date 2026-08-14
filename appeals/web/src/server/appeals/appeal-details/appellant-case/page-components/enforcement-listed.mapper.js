import {
	buildAdditionalDocumentsCard,
	buildEnforcementAppellantDetailsCard,
	buildEnforcementApplicationDetailsCard,
	buildEnforcementBeforeYouStartCard,
	buildEnforcementLandDetailsCard,
	buildFullPlanningAppealDetailsCard,
	buildSummaryListCard,
	getSummaryListItems
} from './common-sections.mapper.js';

/**
 * @typedef {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} SingleAppellantCaseResponse
 * @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} Appeal
 */

/**
 * Builds the Enforcement Listed Building "Grounds and facts" section card component.
 * @param {MappedInstructions} mappedAppellantCaseData
 * @returns {PageComponent|null}
 */
export function buildEnforcementListedGroundsAndFactsCard(mappedAppellantCaseData) {
	return buildSummaryListCard('grounds-and-facts', 'Grounds and facts', [
		mappedAppellantCaseData.descriptionOfAllegedBreach?.display?.summaryListItem,
		mappedAppellantCaseData.groundsForAppeal?.display?.summaryListItem,
		...getSummaryListItems(mappedAppellantCaseData.factsForGrounds),
		...getSummaryListItems(mappedAppellantCaseData.supportingDocumentsForGrounds)
	]);
}

/**
 * Builds the Enforcement Listed Building "Uploaded documents" section card component.
 * @param {MappedInstructions} mappedAppellantCaseData
 * @returns {PageComponent|null}
 */
export function buildEnforcementListedUploadedDocumentsCard(mappedAppellantCaseData) {
	return buildSummaryListCard('uploaded-documents', 'Upload documents', [
		mappedAppellantCaseData.priorCorrespondenceWithPINS?.display?.summaryListItem,
		mappedAppellantCaseData.enforcementNoticeDocuments?.display?.summaryListItem,
		mappedAppellantCaseData.enforcementNoticePlanDocuments?.display?.summaryListItem,
		mappedAppellantCaseData.statusPlanningObligation?.display?.summaryListItem,
		mappedAppellantCaseData.planningObligation?.display?.summaryListItem,
		mappedAppellantCaseData.costsDocument?.display?.summaryListItem,
		mappedAppellantCaseData.otherNewDocuments?.display?.summaryListItem
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
export function generateEnforcementListedComponents(
	appealDetails,
	appellantCaseData,
	mappedAppellantCaseData,
	userHasUpdateCasePermission
) {
	const components = [
		buildEnforcementBeforeYouStartCard(mappedAppellantCaseData),
		buildEnforcementAppellantDetailsCard(appealDetails, mappedAppellantCaseData),
		buildEnforcementLandDetailsCard(mappedAppellantCaseData),
		buildEnforcementListedGroundsAndFactsCard(mappedAppellantCaseData),
		buildEnforcementApplicationDetailsCard(mappedAppellantCaseData),
		buildFullPlanningAppealDetailsCard(mappedAppellantCaseData),
		buildEnforcementListedUploadedDocumentsCard(mappedAppellantCaseData),
		buildAdditionalDocumentsCard(
			appellantCaseData,
			mappedAppellantCaseData,
			userHasUpdateCasePermission
		)
	];

	return components.filter(Boolean);
}
