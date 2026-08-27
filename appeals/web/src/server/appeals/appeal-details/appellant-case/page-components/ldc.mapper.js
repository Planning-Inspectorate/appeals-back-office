import {
	buildAppellantDetailsCard,
	buildBeforeYouStartCard,
	buildSummaryListCard
} from './common-sections.mapper.js';

/**
 * @typedef {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} SingleAppellantCaseResponse
 * @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} Appeal
 */

/**
 * Builds the LDC "Site details" section card component.
 * @param {MappedInstructions} mappedAppellantCaseData
 * @returns {PageComponent|null}
 */
export function buildLdcSiteDetailsCard(mappedAppellantCaseData) {
	return buildSummaryListCard('site-details', 'Site details', [
		mappedAppellantCaseData.siteAddress?.display?.summaryListItem,
		mappedAppellantCaseData.inspectorAccess?.display?.summaryListItem,
		mappedAppellantCaseData.healthAndSafetyIssues?.display?.summaryListItem
	]);
}

/**
 * Builds the LDC "Application details" section card component.
 * @param {MappedInstructions} mappedAppellantCaseData
 * @returns {PageComponent|null}
 */
export function buildLdcApplicationDetailsCard(mappedAppellantCaseData) {
	return buildSummaryListCard('application-summary', 'Application details', [
		mappedAppellantCaseData.applicationDate?.display?.summaryListItem,
		mappedAppellantCaseData.siteUseAtTimeOfApplication?.display?.summaryListItem,
		mappedAppellantCaseData.applicationMadeUnderActSection?.display?.summaryListItem,
		mappedAppellantCaseData.developmentDescription?.display?.summaryListItem,
		mappedAppellantCaseData.changedDevelopmentDescriptionDocument?.display?.summaryListItem,
		mappedAppellantCaseData.relatedAppeals?.display?.summaryListItem
	]);
}

/**
 * Builds the LDC "Appeal details" section card component.
 * @param {MappedInstructions} mappedAppellantCaseData
 * @returns {PageComponent|null}
 */
export function buildLdcAppealDetailsCard(mappedAppellantCaseData) {
	return buildSummaryListCard('appeal-summary', 'Appeal details', [
		mappedAppellantCaseData.procedurePreference?.display?.summaryListItem,
		mappedAppellantCaseData.procedurePreferenceDetails?.display?.summaryListItem,
		mappedAppellantCaseData.procedurePreferenceDuration?.display?.summaryListItem,
		mappedAppellantCaseData.inquiryNumberOfWitnesses?.display?.summaryListItem
	]);
}

/**
 * Builds the LDC "Uploaded documents" section card component.
 * @param {MappedInstructions} mappedAppellantCaseData
 * @returns {PageComponent|null}
 */
export function buildLdcUploadedDocumentsCard(mappedAppellantCaseData) {
	return buildSummaryListCard('uploaded-documents', 'Upload documents', [
		mappedAppellantCaseData.applicationForm?.display?.summaryListItem,
		mappedAppellantCaseData.appealStatement?.display?.summaryListItem,
		mappedAppellantCaseData.costsDocument?.display?.summaryListItem,
		mappedAppellantCaseData.supportingDocuments?.display?.summaryListItem,
		mappedAppellantCaseData.statementCommonGround?.display?.summaryListItem,
		mappedAppellantCaseData.newPlansDrawings?.display?.summaryListItem,
		mappedAppellantCaseData.decisionLetter?.display?.summaryListItem,
		mappedAppellantCaseData.otherNewDocuments?.display?.summaryListItem
	]);
}

/**
 *
 * @param {Appeal} appealDetails
 * @param {SingleAppellantCaseResponse} appellantCaseData
 * @param {MappedInstructions} mappedAppellantCaseData
 * @returns {(PageComponent|null)[]}
 */
export function generateLdcComponents(appealDetails, appellantCaseData, mappedAppellantCaseData) {
	const pageComponents = [
		buildBeforeYouStartCard(mappedAppellantCaseData),
		buildAppellantDetailsCard(appealDetails, mappedAppellantCaseData),
		buildLdcSiteDetailsCard(mappedAppellantCaseData),
		buildLdcApplicationDetailsCard(mappedAppellantCaseData),
		buildLdcAppealDetailsCard(mappedAppellantCaseData),
		buildLdcUploadedDocumentsCard(mappedAppellantCaseData)
	];

	return pageComponents.filter(Boolean);
}
