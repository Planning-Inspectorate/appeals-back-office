import { isFeatureActive } from '#common/feature-flags.js';
import { APPEAL_TYPE, FEATURE_FLAG_NAMES } from '@pins/appeals/constants/common.js';
import { generateAppealDetailsPageComponents as generateHasAppealDetailsPageComponents } from './has.js';
import { generateAppealDetailsPageComponents as generateS78AppealDetailsPageComponents } from './s78.js';

/**
 *
 * @param {import('../appeal-details.types.js').WebAppeal} appealDetails
 * @param {{appeal: MappedInstructions}} mappedData
 * @param {import('express-session').Session & Partial<import('express-session').SessionData>} session
 * @returns {PageComponent[]}
 */
export function generateAppealDetailsSections(appealDetails, mappedData, session) {
	switch (appealDetails.appealType) {
		case APPEAL_TYPE.HOUSEHOLDER:
			return generateHasAppealDetailsPageComponents(appealDetails, mappedData, session);
		case APPEAL_TYPE.CAS_PLANNING:
			return generateHasAppealDetailsPageComponents(appealDetails, mappedData, session);
		case APPEAL_TYPE.CAS_ADVERTISEMENT:
			if (!isFeatureActive(FEATURE_FLAG_NAMES.CAS_ADVERT)) {
				throw new Error('Feature flag inactive for CAS adverts');
			}
			return generateHasAppealDetailsPageComponents(appealDetails, mappedData, session);
		case APPEAL_TYPE.ADVERTISEMENT: {
			if (!isFeatureActive(FEATURE_FLAG_NAMES.ADVERTISEMENT)) {
				throw new Error('Feature flag inactive for adverts');
			}
			return generateS78AppealDetailsPageComponents(appealDetails, mappedData, session);
		}
		case APPEAL_TYPE.S78: //TODO: Feature flag
		case APPEAL_TYPE.PLANNED_LISTED_BUILDING:
			if (!isFeatureActive(FEATURE_FLAG_NAMES.SECTION_78)) {
				throw new Error('Feature flag inactive for S78');
			}
			return generateS78AppealDetailsPageComponents(appealDetails, mappedData, session);
		case APPEAL_TYPE.ENFORCEMENT_NOTICE:
			if (!isFeatureActive(FEATURE_FLAG_NAMES.ENFORCEMENT_NOTICE)) {
				throw new Error('Feature flag inactive for Enforcement Notice');
			}
			return generateS78AppealDetailsPageComponents(appealDetails, mappedData, session);
		case APPEAL_TYPE.LAWFUL_DEVELOPMENT_CERTIFICATE:
			if (!isFeatureActive(FEATURE_FLAG_NAMES.LDC)) {
				throw new Error('Feature flag inactive for LDC');
			}
			return generateS78AppealDetailsPageComponents(appealDetails, mappedData, session);
		default:
			throw new Error('Invalid appealType, unable to generate display page');
	}
}
