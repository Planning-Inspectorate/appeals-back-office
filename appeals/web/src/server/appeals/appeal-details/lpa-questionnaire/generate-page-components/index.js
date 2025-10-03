import { isFeatureActive } from '#common/feature-flags.js';
import { APPEAL_TYPE, FEATURE_FLAG_NAMES } from '@pins/appeals/constants/common.js';
import { generateCasPlanningLpaQuestionnaireComponents } from './cas-planning.js';
import { generateHASLpaQuestionnaireComponents } from './has.js';
import { generateS20LpaQuestionnaireComponents } from './s20.js';
import { generateS78LpaQuestionnaireComponents } from './s78.js';

/**
 * @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} Appeal
 */

/**
 *
 * @param {Appeal} appealDetails
 * @param {{appeal: MappedInstructions}} mappedAppealDetails
 * @param {{lpaq: MappedInstructions}} mappedLPAQData
 * @returns {PageComponent[]}
 */
export function generateCaseTypeSpecificComponents(
	appealDetails,
	mappedAppealDetails,
	mappedLPAQData
) {
	switch (appealDetails.appealType) {
		case APPEAL_TYPE.HOUSEHOLDER:
			return generateHASLpaQuestionnaireComponents(mappedLPAQData, mappedAppealDetails);
		case APPEAL_TYPE.CAS_PLANNING:
			if (isFeatureActive(FEATURE_FLAG_NAMES.CAS)) {
				return generateCasPlanningLpaQuestionnaireComponents(mappedLPAQData, mappedAppealDetails);
			} else {
				throw new Error('Feature flag inactive for CAS');
			}
		case APPEAL_TYPE.CAS_ADVERTISEMENT:
			if (isFeatureActive(FEATURE_FLAG_NAMES.CAS_ADVERT)) {
				return generateHASLpaQuestionnaireComponents(mappedLPAQData, mappedAppealDetails);
			} else {
				throw new Error('Feature flag inactive for CAS');
			}
		case APPEAL_TYPE.S78:
			if (isFeatureActive(FEATURE_FLAG_NAMES.SECTION_78)) {
				return generateS78LpaQuestionnaireComponents(mappedLPAQData, mappedAppealDetails);
			} else {
				throw new Error('Feature flag inactive for S78');
			}
		case APPEAL_TYPE.PLANNED_LISTED_BUILDING:
			if (isFeatureActive(FEATURE_FLAG_NAMES.SECTION_20)) {
				return generateS20LpaQuestionnaireComponents(mappedLPAQData, mappedAppealDetails);
			} else {
				throw new Error('Feature flag inactive for S20');
			}
		default:
			throw new Error('Invalid appealType, unable to generate display page');
	}
}
