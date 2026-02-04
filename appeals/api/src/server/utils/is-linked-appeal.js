import { isFeatureActive } from '#utils/feature-flags.js';
import { FEATURE_FLAG_NAMES } from '@pins/appeals/constants/common.js';
import { CASE_RELATIONSHIP_LINKED } from '@pins/appeals/constants/support.js';
import { APPEAL_CASE_TYPE } from '@planning-inspectorate/data-model';

/**
 *
 * @param {*} [appeal]
 * @returns {boolean}
 */
export const isLinkedAppealsActive = (appeal = null) => {
	const isLinkedAppealsFeatureActive = isFeatureActive(FEATURE_FLAG_NAMES.LINKED_APPEALS);
	const isEnforcementLinkedFeatureActive =
		isFeatureActive(FEATURE_FLAG_NAMES.ENFORCEMENT_NOTICE) &&
		isFeatureActive(FEATURE_FLAG_NAMES.ENFORCEMENT_LINKED) &&
		(!appeal || appeal.appealType?.key === APPEAL_CASE_TYPE.C);
	return isLinkedAppealsFeatureActive || isEnforcementLinkedFeatureActive;
};

/**
 *
 * @param {*} appeal
 * @returns {boolean}
 */
export const hasChildAppeals = (appeal) =>
	isLinkedAppealsActive(appeal) && appeal.childAppeals?.length;

/**
 *
 * @param {*} appeal
 * @returns {boolean}
 */
export const isChildAppeal = (appeal) => {
	return (
		isLinkedAppealsActive(appeal) &&
		// @ts-ignore
		appeal.parentAppeals?.some((linkedAppeal) => linkedAppeal.type === CASE_RELATIONSHIP_LINKED)
	);
};

/**
 *
 * @param {*} appeal
 * @returns {boolean}
 */
export const isParentAppeal = (appeal) => {
	return (
		isLinkedAppealsActive(appeal) &&
		// @ts-ignore
		appeal.childAppeals?.some((linkedAppeal) => linkedAppeal.type === CASE_RELATIONSHIP_LINKED)
	);
};

/**
 *
 * @param {*} appeal
 * @returns {boolean}
 */
export const isLinkedAppeal = (appeal) => {
	return isChildAppeal(appeal) || isParentAppeal(appeal);
};
