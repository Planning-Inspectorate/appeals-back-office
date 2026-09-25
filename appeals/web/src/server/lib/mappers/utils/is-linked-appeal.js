import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { isLinkedAppealsActiveForAppealOrCaseType } from '@pins/appeals/utils/appeal-type-checks.js';

/**
 *
 * @param {*} appeal
 * @returns {boolean}
 */
export function isChildAppeal(appeal) {
	return appeal.isChildAppeal && isLinkedAppealsActiveForAppealOrCaseType(appeal?.appealType);
}

/**
 *
 * @param {*} appeal
 * @returns {boolean}
 */
export function isEnforcementChildAppeal(appeal) {
	const { appealType, type = appealType } = appeal || {};
	return (
		appeal.isChildAppeal &&
		isLinkedAppealsActiveForAppealOrCaseType(appeal?.appealType) &&
		type === APPEAL_TYPE.ENFORCEMENT_NOTICE
	);
}

/**
 *
 * @param {*} appeal
 * @returns {boolean}
 */
export function isParentAppeal(appeal) {
	return appeal.isParentAppeal && isLinkedAppealsActiveForAppealOrCaseType(appeal?.appealType);
}

/**
 *
 * @param {*} appeal
 * @returns {boolean}
 */
export default function isLinkedAppeal(appeal) {
	return isChildAppeal(appeal) || isParentAppeal(appeal);
}

/**
 *
 * @param {*} appeal
 * @returns {boolean}
 */
export function isAwaitingLinkedAppeal(appeal) {
	const { appealType, type } = appeal || {};
	return (
		appeal.awaitingLinkedAppeal && isLinkedAppealsActiveForAppealOrCaseType(type || appealType)
	);
}
