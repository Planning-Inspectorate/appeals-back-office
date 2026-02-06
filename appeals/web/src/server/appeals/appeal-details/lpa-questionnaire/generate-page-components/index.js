import { isFeatureActive } from '#common/feature-flags.js';
import { APPEAL_TYPE, FEATURE_FLAG_NAMES } from '@pins/appeals/constants/common.js';
import { generateAdvertLpaQuestionnaireComponents } from './advert.js';
import { generateCasAdvertLpaQuestionnaireComponents } from './cas-advert.js';
import { generateCasPlanningLpaQuestionnaireComponents } from './cas-planning.js';
import { generateEnforcementLpaQuestionnaireComponents } from './enforcement.js';
import { generateHASLpaQuestionnaireComponents } from './has.js';
import { generateLdcLpaQuestionnaireComponents } from './ldc.js';
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
			return generateCasPlanningLpaQuestionnaireComponents(mappedLPAQData, mappedAppealDetails);
		case APPEAL_TYPE.CAS_ADVERTISEMENT:
			if (isFeatureActive(FEATURE_FLAG_NAMES.CAS_ADVERT)) {
				return generateCasAdvertLpaQuestionnaireComponents(mappedLPAQData, mappedAppealDetails);
			} else {
				throw new Error('Feature flag inactive for CAS');
			}
		case APPEAL_TYPE.ADVERTISEMENT:
			if (isFeatureActive(FEATURE_FLAG_NAMES.ADVERTISEMENT)) {
				return generateAdvertLpaQuestionnaireComponents(mappedLPAQData, mappedAppealDetails);
			} else {
				throw new Error('Feature flag inactive for adverts');
			}
		case APPEAL_TYPE.LAWFUL_DEVELOPMENT_CERTIFICATE:
			if (isFeatureActive(FEATURE_FLAG_NAMES.LDC)) {
				return generateLdcLpaQuestionnaireComponents(mappedLPAQData, mappedAppealDetails);
			} else {
				throw new Error('Feature flag inactive for Ldc');
			}
		case APPEAL_TYPE.ENFORCEMENT_NOTICE:
			if (isFeatureActive(FEATURE_FLAG_NAMES.ENFORCEMENT_NOTICE)) {
				return generateEnforcementLpaQuestionnaireComponents(mappedLPAQData, mappedAppealDetails);
			}
			throw new Error('Enforcement feature flag is disabled');
		case APPEAL_TYPE.S78:
			if (isFeatureActive(FEATURE_FLAG_NAMES.SECTION_78)) {
				return generateS78LpaQuestionnaireComponents(mappedLPAQData, mappedAppealDetails);
			} else {
				throw new Error('Feature flag inactive for S78');
			}
		case APPEAL_TYPE.PLANNED_LISTED_BUILDING:
			return generateS20LpaQuestionnaireComponents(mappedLPAQData, mappedAppealDetails);
		default:
			throw new Error('Invalid appealType, unable to generate display page');
	}
}
