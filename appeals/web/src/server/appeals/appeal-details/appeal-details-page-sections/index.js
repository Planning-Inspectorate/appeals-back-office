import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
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
		default:
			throw new Error('Invalid appealType, unable to generate display page');
	}
}
