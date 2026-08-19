import { isFeatureActive } from '#common/feature-flags.js';
import { APPEAL_TYPE, FEATURE_FLAG_NAMES } from '@pins/appeals/constants/common.js';
import { beforeExpeditedOriginalApplicationCutOff } from '@pins/appeals/utils/appeal-type-checks.js';
import {
	buildAdditionalDocumentsCard,
	buildAppealDetailsCard,
	buildAppellantDetailsCard,
	buildApplicationDetailsCard,
	buildBeforeYouStartCard,
	buildSiteDetailsCard,
	buildSummaryListCard
} from './common-sections.mapper.js';

/**
 * @typedef {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} SingleAppellantCaseResponse
 * @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} Appeal
 */

/**
 * Builds the HAS "Uploaded documents" card section.
 * @param {SingleAppellantCaseResponse} appellantCaseData
 * @param {MappedInstructions} mappedAppellantCaseData
 * @returns {PageComponent|null}
 */
export function buildHASUploadedDocumentsCard(appellantCaseData, mappedAppellantCaseData) {
	return buildSummaryListCard('uploaded-documents', 'Upload documents', [
		mappedAppellantCaseData.applicationForm?.display?.summaryListItem,
		mappedAppellantCaseData.changedDevelopmentDescriptionDocument?.display?.summaryListItem,
		...(beforeExpeditedOriginalApplicationCutOff(appellantCaseData.applicationDate)
			? [mappedAppellantCaseData.appealStatement?.display?.summaryListItem]
			: []),
		mappedAppellantCaseData.costsDocument?.display?.summaryListItem
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
export function generateHASComponents(
	appealDetails,
	appellantCaseData,
	mappedAppellantCaseData,
	userHasUpdateCasePermission
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
		buildSiteDetailsCard(mappedAppellantCaseData),
		buildApplicationDetailsCard(mappedAppellantCaseData),
		isExpeditedEligible ? buildAppealDetailsCard(mappedAppellantCaseData) : null,
		buildHASUploadedDocumentsCard(appellantCaseData, mappedAppellantCaseData),
		buildAdditionalDocumentsCard(
			appellantCaseData,
			mappedAppellantCaseData,
			userHasUpdateCasePermission
		)
	];

	return components.filter(Boolean);
}
