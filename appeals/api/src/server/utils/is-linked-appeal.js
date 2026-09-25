import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { CASE_RELATIONSHIP_LINKED } from '@pins/appeals/constants/support.js';
import { isLinkedAppealsActiveForAppealOrCaseType } from '@pins/appeals/utils/appeal-type-checks.js';

/**
 *
 * @param {*} appeal
 * @param {*} isChildAppeal
 * @returns {boolean}
 */
export function isEnforcementChildAppeal(appeal, isChildAppeal = appeal?.isChildAppeal) {
	const { appealType } = appeal || {};
	return (
		isChildAppeal &&
		isLinkedAppealsActiveForAppealOrCaseType(appeal?.appealType?.key) &&
		appealType.type === APPEAL_TYPE.ENFORCEMENT_NOTICE
	);
}

/**
 *
 * @param {*} appeal
 * @returns {boolean}
 */
export const hasChildLinkedAppeals = (appeal) =>
	isLinkedAppealsActiveForAppealOrCaseType(appeal?.appealType?.key) &&
	appeal.childAppeals?.filter(
		//@ts-ignore
		(childAppeal) => childAppeal.type === CASE_RELATIONSHIP_LINKED
	).length;

/**
 *
 * @param {*} appeal
 * @returns {boolean}
 */
export const isChildAppeal = (appeal) => {
	return (
		isLinkedAppealsActiveForAppealOrCaseType(appeal?.appealType?.key) &&
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
		isLinkedAppealsActiveForAppealOrCaseType(appeal?.appealType?.key) &&
		// @ts-ignore
		appeal?.childAppeals?.some((linkedAppeal) => linkedAppeal.type === CASE_RELATIONSHIP_LINKED)
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
