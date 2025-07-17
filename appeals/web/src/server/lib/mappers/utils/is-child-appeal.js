import config from '#environment/config.js';

/**
 *
 * @param {*} appeal
 * @returns {boolean}
 */
export function isChildAppeal(appeal) {
	return appeal.isChildAppeal && config.featureFlags.featureFlagLinkedAppeals;
}
