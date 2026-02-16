import { isFeatureActive } from '#common/feature-flags.js';
import { APPEAL_TYPE, FEATURE_FLAG_NAMES } from '@pins/appeals/constants/common.js';
import { isAppealTypeEnabled } from './feature-flags-appeal-types.js';

/**
 *
 * @returns Array<string>
 */
export const getEnabledHearingAppealTypes = () => {
	let enabledHearingAppealTypes = [];
	if (isAppealTypeEnabled(APPEAL_TYPE.S78)) {
		enabledHearingAppealTypes.push(APPEAL_TYPE.S78);
	}

	if (
		isAppealTypeEnabled(APPEAL_TYPE.PLANNED_LISTED_BUILDING) &&
		isFeatureActive(FEATURE_FLAG_NAMES.S20_HEARING)
	) {
		enabledHearingAppealTypes.push(APPEAL_TYPE.PLANNED_LISTED_BUILDING);
	}

	if (
		isAppealTypeEnabled(APPEAL_TYPE.ENFORCEMENT_NOTICE) &&
		isFeatureActive(FEATURE_FLAG_NAMES.ENFORCEMENT_HEARING)
	) {
		enabledHearingAppealTypes.push(APPEAL_TYPE.ENFORCEMENT_NOTICE);
	}

	if (
		isAppealTypeEnabled(APPEAL_TYPE.LAWFUL_DEVELOPMENT_CERTIFICATE) &&
		isFeatureActive(FEATURE_FLAG_NAMES.LDC_HEARING)
	) {
		enabledHearingAppealTypes.push(APPEAL_TYPE.LAWFUL_DEVELOPMENT_CERTIFICATE);
	}

	if (
		isAppealTypeEnabled(APPEAL_TYPE.ENFORCEMENT_LISTED_BUILDING) &&
		isFeatureActive(FEATURE_FLAG_NAMES.ELB_HEARING)
	) {
		enabledHearingAppealTypes.push(APPEAL_TYPE.ENFORCEMENT_LISTED_BUILDING);
	}

	return enabledHearingAppealTypes;
};
