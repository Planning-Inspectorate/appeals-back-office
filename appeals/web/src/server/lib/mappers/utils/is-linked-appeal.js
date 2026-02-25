import config from '#environment/config.js';
import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';

/**
 *
 * @param {*} [appeal]
 * @returns {boolean}
 */
export const isLinkedAppealsActive = (appeal = null) => {
	const { appealType, type = appealType } = appeal || {};
	const isLinkedAppealsFeatureActive = config.featureFlags.featureFlagLinkedAppeals;
	const isEnforcementLinkedFeatureActive =
		config.featureFlags.featureFlagEnforcementNotice &&
		config.featureFlags.featureFlagEnforcementLinked &&
		(!appeal || type === APPEAL_TYPE.ENFORCEMENT_NOTICE);

	return isLinkedAppealsFeatureActive || isEnforcementLinkedFeatureActive;
};

/**
 *
 * @param {*} appeal
 * @returns {boolean}
 */
export function isChildAppeal(appeal) {
	return appeal.isChildAppeal && isLinkedAppealsActive(appeal);
}

/**
 *
 * @param {*} appeal
 * @returns {boolean}
 */
export function isParentAppeal(appeal) {
	return appeal.isParentAppeal && isLinkedAppealsActive(appeal);
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
	const { appealType, type, ...rest } = appeal || {};
	return (
		appeal.awaitingLinkedAppeal && isLinkedAppealsActive({ ...rest, type: type || appealType })
	);
}

/**
 * This helper function is primarily here to prevent enforcement notice linked appeals from being able to start in the initial release
 * @param {*} appeal
 * @returns {boolean}
 */
export function canStartAppeal(appeal) {
	if (config.featureFlags.featureFlagEnforcementLeadCanStart) {
		return true;
	}

	// If it's not a parent appeal (or linked appeals aren't active), we can start.
	if (!isParentAppeal(appeal)) {
		return true;
	}

	// Only block start for Enforcement Notice parent appeals.
	return appeal?.appealType !== APPEAL_TYPE.ENFORCEMENT_NOTICE;
}
