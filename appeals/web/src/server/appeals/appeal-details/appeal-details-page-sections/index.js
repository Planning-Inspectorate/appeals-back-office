import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { generateAppealDetailsPageComponents as generateGenericAppealDetailsPageComponents } from './generic.js';
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
		case APPEAL_TYPE.CAS_PLANNING:
		case APPEAL_TYPE.CAS_ADVERTISEMENT:
			return generateHasAppealDetailsPageComponents(appealDetails, mappedData, session);
		case APPEAL_TYPE.ADVERTISEMENT:
		case APPEAL_TYPE.S78:
		case APPEAL_TYPE.PLANNED_LISTED_BUILDING:
		case APPEAL_TYPE.ENFORCEMENT_NOTICE:
		case APPEAL_TYPE.ENFORCEMENT_LISTED_BUILDING:
		case APPEAL_TYPE.LAWFUL_DEVELOPMENT_CERTIFICATE:
			return generateS78AppealDetailsPageComponents(appealDetails, mappedData, session);
		case APPEAL_TYPE.DISCONTINUANCE_NOTICE:
		case APPEAL_TYPE.COMMUNITY_INFRASTRUCTURE_LEVY:
		case APPEAL_TYPE.PLANNING_OBLIGATION:
		case APPEAL_TYPE.TREE_PRESERVATION_ORDER:
		case APPEAL_TYPE.TREE_REPLACEMENT_NOTICE:
		case APPEAL_TYPE.HIGH_HEDGES:
		case APPEAL_TYPE.HEDGEROWS:
		case APPEAL_TYPE.ENVIRONMENTAL:
			return generateGenericAppealDetailsPageComponents(appealDetails, mappedData, session);
		default:
			throw new Error('Invalid appealType, unable to generate display page');
	}
}
