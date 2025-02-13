import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { generateAccordion as generateHasAccordion } from './has.js';
import { generateAccordion as generateS78Accordion } from './s78.js';
import { isFeatureActive } from '#common/feature-flags.js';
import { FEATURE_FLAG_NAMES } from '@pins/appeals/constants/common.js';

/**
 * @typedef {Object} RepresentationTypesAwaitingReview
 * @property {boolean} ipComments
 * @property {boolean} appellantFinalComments
 * @property {boolean} lpaFinalComments
 * @property {boolean} lpaStatement
 */

/**
 *
 * @param {import('../appeal-details.types.js').WebAppeal} appealDetails
 * @param {{appeal: MappedInstructions}} mappedData
 * @param {import('express-session').Session & Partial<import('express-session').SessionData>} session
 * @returns {PageComponent}
 */
export function generateAccordionItems(appealDetails, mappedData, session) {
	switch (appealDetails.appealType) {
		case APPEAL_TYPE.D:
			return generateHasAccordion(appealDetails, mappedData, session);
		case APPEAL_TYPE.W:
			if (!isFeatureActive(FEATURE_FLAG_NAMES.SECTION_78)) {
				throw new Error('Feature flag inactive for S78');
			}
			return generateS78Accordion(appealDetails, mappedData, session);
		default:
			throw new Error('Invalid appealType, unable to generate display page');
	}
}
