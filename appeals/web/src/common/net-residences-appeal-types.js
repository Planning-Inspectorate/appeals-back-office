import config from '#environment/config.js';
import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';

/**
 *
 * @param {string | null | undefined } appealType
 * @returns boolean
 */
export const isNetResidencesAppealType = (appealType) => {
	if (
		appealType === APPEAL_TYPE.S78 ||
		(config.featureFlags.featureFlagNetResidenceS20 &&
			appealType === APPEAL_TYPE.PLANNED_LISTED_BUILDING)
	) {
		return true;
	}

	return false;
};
