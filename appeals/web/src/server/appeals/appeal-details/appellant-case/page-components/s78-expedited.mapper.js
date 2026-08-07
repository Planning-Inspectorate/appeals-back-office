import { isFeatureActive } from '#common/feature-flags.js';
import { FEATURE_FLAG_NAMES } from '@pins/appeals/constants/common.js';
import {
	buildAdditionalDocumentsCard,
	buildAppellantDetailsCard,
	buildBeforeYouStartCard,
	buildFullPlanningApplicationDetailsCard,
	buildSummaryListCard
} from './common-sections.mapper.js';

/**
 * @typedef {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} SingleAppellantCaseResponse
 * @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} Appeal
 */

/**
 * Builds the S78 Expedited "Site details" section card component.
 * @param {SingleAppellantCaseResponse} appellantCaseData
 * @param {MappedInstructions} mappedAppellantCaseData
 * @param {boolean} isExpeditedAppealsActive
 * @returns {PageComponent|null}
 */
export function buildS78ExpeditedSiteDetailsCard(
	appellantCaseData,
	mappedAppellantCaseData,
	isExpeditedAppealsActive
) {
	return buildSummaryListCard('site-details', 'Site details', [
		mappedAppellantCaseData.siteAddress?.display?.summaryListItem,
		mappedAppellantCaseData.siteArea?.display?.summaryListItem,
		mappedAppellantCaseData.inGreenBelt?.display?.summaryListItem,
		mappedAppellantCaseData.siteOwnership?.display?.summaryListItem,
		mappedAppellantCaseData.ownersKnown?.display?.summaryListItem,
		mappedAppellantCaseData.partOfAgriculturalHolding?.display?.summaryListItem,
		mappedAppellantCaseData.tenantOfAgriculturalHolding?.display?.summaryListItem,
		mappedAppellantCaseData.otherTenantsOfAgriculturalHolding?.display?.summaryListItem,
		mappedAppellantCaseData.inspectorAccess?.display?.summaryListItem,
		mappedAppellantCaseData.healthAndSafetyIssues?.display?.summaryListItem,
		...(isExpeditedAppealsActive && appellantCaseData.anySignificantChanges != null
			? [mappedAppellantCaseData.anySignificantChanges?.display?.summaryListItem]
			: [])
	]);
}

/**
 * Builds the S78 Expedited "Appeal details" section card component.
 * @param {SingleAppellantCaseResponse} appellantCaseData
 * @param {MappedInstructions} mappedAppellantCaseData
 * @param {boolean} isExpeditedAppealsActive
 * @returns {PageComponent|null}
 */
export function buildS78ExpeditedAppealDetailsCard(
	appellantCaseData,
	mappedAppellantCaseData,
	isExpeditedAppealsActive
) {
	const includeReason =
		isExpeditedAppealsActive && appellantCaseData.reasonForAppealAppellant != null;

	return buildSummaryListCard('appeal-summary', 'Appeal details', [
		mappedAppellantCaseData.procedurePreference?.display?.summaryListItem,
		mappedAppellantCaseData.procedurePreferenceDetails?.display?.summaryListItem,
		mappedAppellantCaseData.procedurePreferenceDuration?.display?.summaryListItem,
		mappedAppellantCaseData.inquiryNumberOfWitnesses?.display?.summaryListItem,
		...(includeReason
			? [mappedAppellantCaseData.reasonForAppealAppellant?.display?.summaryListItem]
			: [])
	]);
}

/**
 * Builds the S78 Expedited "Uploaded documents" section card component.
 * @param {SingleAppellantCaseResponse} appellantCaseData
 * @param {MappedInstructions} mappedAppellantCaseData
 * @param {boolean} isExpeditedAppealsActive
 * @returns {PageComponent|null}
 */
export function buildS78ExpeditedUploadedDocumentsCard(
	appellantCaseData,
	mappedAppellantCaseData,
	isExpeditedAppealsActive
) {
	if (appellantCaseData.ownershipCertificate != null) {
		return buildSummaryListCard('uploaded-documents', 'Upload documents', [
			mappedAppellantCaseData.applicationForm?.display?.summaryListItem,
			mappedAppellantCaseData.changedDevelopmentDescriptionDocument?.display?.summaryListItem,
			mappedAppellantCaseData.decisionLetter?.display?.summaryListItem,
			mappedAppellantCaseData.planningObligation?.display?.summaryListItem,
			mappedAppellantCaseData.appealStatement?.display?.summaryListItem,
			mappedAppellantCaseData.statementCommonGround?.display?.summaryListItem,
			mappedAppellantCaseData.ownershipCertificate?.display?.summaryListItem,
			mappedAppellantCaseData.designAccessStatement?.display?.summaryListItem,
			mappedAppellantCaseData.plansDrawings?.display?.summaryListItem,
			mappedAppellantCaseData.newPlansDrawings?.display?.summaryListItem,
			mappedAppellantCaseData.newSupportingDocuments?.display?.summaryListItem,
			...(isExpeditedAppealsActive
				? [mappedAppellantCaseData.ownershipCertificateExpedited?.display?.summaryListItem]
				: []),
			mappedAppellantCaseData.costsDocument?.display?.summaryListItem,
			...(isExpeditedAppealsActive && appellantCaseData.screeningOpinionIndicatesEiaRequired != null
				? [mappedAppellantCaseData.screeningOpinionIndicatesEiaRequired?.display?.summaryListItem]
				: []),
			...(isExpeditedAppealsActive
				? [mappedAppellantCaseData.environmentalStatement?.display?.summaryListItem]
				: [])
		]);
	}

	// Legacy base s20 uploaded docs section without appealStatement
	return buildSummaryListCard('uploaded-documents', 'Upload documents', [
		mappedAppellantCaseData.applicationForm?.display?.summaryListItem,
		mappedAppellantCaseData.changedDevelopmentDescriptionDocument?.display?.summaryListItem,
		mappedAppellantCaseData.decisionLetter?.display?.summaryListItem,
		mappedAppellantCaseData.statusPlanningObligation?.display?.summaryListItem,
		mappedAppellantCaseData.planningObligation?.display?.summaryListItem,
		mappedAppellantCaseData.statementCommonGround?.display?.summaryListItem,
		mappedAppellantCaseData.ownershipCertificate?.display?.summaryListItem,
		mappedAppellantCaseData.costsDocument?.display?.summaryListItem,
		mappedAppellantCaseData.designAccessStatement?.display?.summaryListItem,
		mappedAppellantCaseData.supportingDocuments?.display?.summaryListItem,
		mappedAppellantCaseData.newPlansDrawings?.display?.summaryListItem,
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
export function generateS78ExpeditedComponents(
	appealDetails,
	appellantCaseData,
	mappedAppellantCaseData,
	userHasUpdateCasePermission
) {
	const isExpeditedAppealsActive = isFeatureActive(FEATURE_FLAG_NAMES.EXPEDITED_APPEALS);

	const components = [
		buildBeforeYouStartCard(mappedAppellantCaseData),
		buildAppellantDetailsCard(appealDetails, mappedAppellantCaseData),
		buildS78ExpeditedSiteDetailsCard(
			appellantCaseData,
			mappedAppellantCaseData,
			isExpeditedAppealsActive
		),
		buildFullPlanningApplicationDetailsCard(mappedAppellantCaseData),
		buildS78ExpeditedAppealDetailsCard(
			appellantCaseData,
			mappedAppellantCaseData,
			isExpeditedAppealsActive
		),
		buildS78ExpeditedUploadedDocumentsCard(
			appellantCaseData,
			mappedAppellantCaseData,
			isExpeditedAppealsActive
		),
		buildAdditionalDocumentsCard(
			appellantCaseData,
			mappedAppellantCaseData,
			userHasUpdateCasePermission
		)
	];

	return components.filter(Boolean);
}
