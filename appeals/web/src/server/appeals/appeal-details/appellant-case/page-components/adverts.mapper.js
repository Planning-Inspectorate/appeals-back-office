import {
	buildAdvertApplicationDetailsCard,
	buildAdvertSiteDetailsCard,
	buildAppellantDetailsCard,
	buildBeforeYouStartCard,
	buildSummaryListCard
} from './common-sections.mapper.js';

/**
 * @typedef {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} SingleAppellantCaseResponse
 * @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} Appeal
 */

/**
 * Builds the Advert "Appeal details" section card component.
 * @param {MappedInstructions} mappedAppellantCaseData
 * @returns {PageComponent|null}
 */
export function buildAdvertAppealDetailsCard(mappedAppellantCaseData) {
	return buildSummaryListCard('appeal-summary', 'Appeal details', [
		mappedAppellantCaseData.procedurePreference?.display?.summaryListItem,
		mappedAppellantCaseData.procedurePreferenceDetails?.display?.summaryListItem,
		mappedAppellantCaseData.procedurePreferenceDuration?.display?.summaryListItem,
		mappedAppellantCaseData.inquiryNumberOfWitnesses?.display?.summaryListItem
	]);
}

/**
 * Builds the Advert "Upload documents" section card component.
 * @param {MappedInstructions} mappedAppellantCaseData
 * @returns {PageComponent|null}
 */
export function buildAdvertUploadedDocumentsCard(mappedAppellantCaseData) {
	return buildSummaryListCard('uploaded-documents', 'Upload documents', [
		mappedAppellantCaseData.applicationForm?.display?.summaryListItem,
		mappedAppellantCaseData.appealStatement?.display?.summaryListItem,
		mappedAppellantCaseData.costsDocument?.display?.summaryListItem,
		mappedAppellantCaseData.supportingDocuments?.display?.summaryListItem
	]);
}

/**
 *
 * @param {Appeal} appealDetails
 * @param {SingleAppellantCaseResponse} appellantCaseData
 * @param {MappedInstructions} mappedAppellantCaseData
 * @returns {(PageComponent|null)[]}
 */
export function generateAdvertComponents(
	appealDetails,
	appellantCaseData,
	mappedAppellantCaseData
) {
	const components = [
		buildBeforeYouStartCard(mappedAppellantCaseData),
		buildAppellantDetailsCard(appealDetails, mappedAppellantCaseData),
		buildAdvertSiteDetailsCard(mappedAppellantCaseData),
		buildAdvertApplicationDetailsCard(mappedAppellantCaseData),
		buildAdvertAppealDetailsCard(mappedAppellantCaseData),
		buildAdvertUploadedDocumentsCard(mappedAppellantCaseData)
	];

	return components.filter(Boolean);
}
