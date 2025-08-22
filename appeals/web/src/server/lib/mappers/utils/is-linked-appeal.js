import config from '#environment/config.js';

/**
 *
 * @param {*} appeal
 * @returns {boolean}
 */
export function isChildAppeal(appeal) {
	return appeal.isChildAppeal && config.featureFlags.featureFlagLinkedAppeals;
}

/**
 *
 * @param {*} appeal
 * @returns {boolean}
 */
export function isParentAppeal(appeal) {
	return appeal.isParentAppeal && config.featureFlags.featureFlagLinkedAppeals;
}

/**
 *
 * @param {*} appeal
 * @returns {boolean}
 */
export default function isLinkedAppeal(appeal) {
	return isChildAppeal(appeal) || isParentAppeal(appeal);
}
