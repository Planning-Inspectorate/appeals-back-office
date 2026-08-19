import { isFeatureActive } from '#common/feature-flags.js';
import { APPEAL_TYPE, FEATURE_FLAG_NAMES } from '@pins/appeals/constants/common.js';
import { beforeExpeditedOriginalApplicationCutOff } from '@pins/appeals/utils/appeal-type-checks.js';
import {
	buildAdvertApplicationDetailsCard,
	buildAdvertSiteDetailsCard,
	buildAppealDetailsCard,
	buildAppellantDetailsCard,
	buildBeforeYouStartCard,
	buildSummaryListCard
} from './common-sections.mapper.js';

/**
 * @typedef {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} SingleAppellantCaseResponse
 * @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} Appeal
 */

/**
 * Builds the CAS Advert "Uploaded documents" section card component.
 * @param {SingleAppellantCaseResponse} appellantCaseData
 * @param {MappedInstructions} mappedAppellantCaseData
 * @returns {PageComponent|null}
 */
export function buildCASAdvertUploadedDocumentsCard(appellantCaseData, mappedAppellantCaseData) {
	return buildSummaryListCard('uploaded-documents', 'Upload documents', [
		mappedAppellantCaseData.applicationForm?.display?.summaryListItem,
		...(beforeExpeditedOriginalApplicationCutOff(appellantCaseData.applicationDate)
			? [mappedAppellantCaseData.appealStatement?.display?.summaryListItem]
			: []),
		mappedAppellantCaseData.costsDocument?.display?.summaryListItem,
		...(beforeExpeditedOriginalApplicationCutOff(appellantCaseData.applicationDate)
			? [mappedAppellantCaseData.supportingDocuments?.display?.summaryListItem]
			: [])
	]);
}

/**
 *
 * @param {Appeal} appealDetails
 * @param {SingleAppellantCaseResponse} appellantCaseData
 * @param {MappedInstructions} mappedAppellantCaseData
 * @returns {(PageComponent|null)[]}
 */
export function generateCASAdvertComponents(
	appealDetails,
	appellantCaseData,
	mappedAppellantCaseData
) {
	const isExpeditedAppealsActive = isFeatureActive(FEATURE_FLAG_NAMES.EXPEDITED_APPEALS);
	const isExpeditedEligible =
		isExpeditedAppealsActive &&
		(appealDetails.appealType === APPEAL_TYPE.HOUSEHOLDER ||
			appealDetails.appealType === APPEAL_TYPE.CAS_PLANNING ||
			appealDetails.appealType === APPEAL_TYPE.CAS_ADVERTISEMENT) &&
		!beforeExpeditedOriginalApplicationCutOff(appellantCaseData.applicationDate);

	const components = [
		buildBeforeYouStartCard(mappedAppellantCaseData),
		buildAppellantDetailsCard(appealDetails, mappedAppellantCaseData),
		buildAdvertSiteDetailsCard(mappedAppellantCaseData),
		buildAdvertApplicationDetailsCard(mappedAppellantCaseData),
		isExpeditedEligible ? buildAppealDetailsCard(mappedAppellantCaseData) : null,
		buildCASAdvertUploadedDocumentsCard(appellantCaseData, mappedAppellantCaseData)
	];

	return components.filter(Boolean);
}
