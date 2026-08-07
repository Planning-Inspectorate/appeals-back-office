import {
	buildAdditionalDocumentsCard,
	buildEnforcementAppellantDetailsCard,
	buildEnforcementApplicationDetailsCard,
	buildEnforcementBeforeYouStartCard,
	buildEnforcementLandDetailsCard,
	buildFullPlanningAppealDetailsCard,
	buildSummaryListCard
} from './common-sections.mapper.js';

/**
 * @typedef {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} SingleAppellantCaseResponse
 * @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} Appeal
 */

/**
 * Helper to extract summaryListItem from subMapper array or object.
 * @param {any} [subMapperList]
 * @returns {any[]}
 */
export function getSummaryListItems(subMapperList) {
	if (!subMapperList) return [];
	const list = Array.isArray(subMapperList) ? subMapperList : [subMapperList];
	return list.map((subMapper) => subMapper?.display?.summaryListItem).filter(Boolean);
}

/**
 * Builds the Enforcement Notice "Grounds and facts" section card component.
 * @param {MappedInstructions} mappedAppellantCaseData
 * @returns {PageComponent|null}
 */
export function buildEnforcementGroundsAndFactsCard(mappedAppellantCaseData) {
	return buildSummaryListCard('grounds-and-facts', 'Grounds and facts', [
		mappedAppellantCaseData.descriptionOfAllegedBreach?.display?.summaryListItem,
		mappedAppellantCaseData.groundsForAppeal?.display?.summaryListItem,
		...getSummaryListItems(mappedAppellantCaseData.factsForGrounds),
		...getSummaryListItems(mappedAppellantCaseData.supportingDocumentsForGrounds),
		mappedAppellantCaseData.retrospectiveApplication?.display?.summaryListItem,
		mappedAppellantCaseData.groundAFeeReceipt?.display?.summaryListItem,
		mappedAppellantCaseData.applicationDevelopmentAllOrPart?.display?.summaryListItem,
		mappedAppellantCaseData.applicationReference?.display?.summaryListItem,
		mappedAppellantCaseData.applicationDate?.display?.summaryListItem,
		mappedAppellantCaseData.developmentDescription?.display?.summaryListItem,
		mappedAppellantCaseData.applicationDecision?.display?.summaryListItem,
		mappedAppellantCaseData.applicationDecisionDate?.display?.summaryListItem,
		mappedAppellantCaseData.appealDecisionDate?.display?.summaryListItem
	]);
}

/**
 * Builds the Enforcement Notice "Uploaded documents" section card component.
 * @param {MappedInstructions} mappedAppellantCaseData
 * @returns {PageComponent|null}
 */
export function buildEnforcementNoticeUploadedDocumentsCard(mappedAppellantCaseData) {
	return buildSummaryListCard('uploaded-documents', 'Upload documents', [
		mappedAppellantCaseData.priorCorrespondenceWithPINS?.display?.summaryListItem,
		mappedAppellantCaseData.enforcementNoticeDocuments?.display?.summaryListItem,
		mappedAppellantCaseData.enforcementNoticePlanDocuments?.display?.summaryListItem,
		mappedAppellantCaseData.applicationForm?.display?.summaryListItem,
		mappedAppellantCaseData.changedDevelopmentDescriptionDocument?.display?.summaryListItem,
		mappedAppellantCaseData.decisionLetter?.display?.summaryListItem,
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
export function generateEnforcementNoticeComponents(
	appealDetails,
	appellantCaseData,
	mappedAppellantCaseData,
	userHasUpdateCasePermission
) {
	const components = [
		buildEnforcementBeforeYouStartCard(mappedAppellantCaseData),
		buildEnforcementAppellantDetailsCard(appealDetails, mappedAppellantCaseData),
		buildEnforcementLandDetailsCard(mappedAppellantCaseData),
		buildEnforcementGroundsAndFactsCard(mappedAppellantCaseData),
		buildEnforcementApplicationDetailsCard(mappedAppellantCaseData),
		buildFullPlanningAppealDetailsCard(mappedAppellantCaseData),
		buildEnforcementNoticeUploadedDocumentsCard(mappedAppellantCaseData),
		buildAdditionalDocumentsCard(
			appellantCaseData,
			mappedAppellantCaseData,
			userHasUpdateCasePermission
		)
	];

	return components.filter(Boolean);
}
