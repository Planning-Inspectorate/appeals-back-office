import { isFeatureActive } from '#utils/feature-flags.js';
import { FEATURE_FLAG_NAMES } from '@pins/appeals/constants/common.js';
import { CASE_RELATIONSHIP_LINKED } from '@pins/appeals/constants/support.js';

/**
 *
 * @param {*} appeal
 * @returns {boolean}
 */
export const isLinkedAppeal = (appeal) => {
	if (!isFeatureActive(FEATURE_FLAG_NAMES.LINKED_APPEALS)) {
		return false;
	}
	return (
		// @ts-ignore
		appeal.parentAppeals?.some((linkedAppeal) => linkedAppeal.type === CASE_RELATIONSHIP_LINKED) || // @ts-ignore
		appeal.childAppeals?.some((linkedAppeal) => linkedAppeal.type === CASE_RELATIONSHIP_LINKED)
	);
};
