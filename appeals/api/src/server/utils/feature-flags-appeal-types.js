import { APPEAL_CASE_TYPE } from '@planning-inspectorate/data-model';
import { isFeatureActive } from './feature-flags.js';
import { FEATURE_FLAG_NAMES } from '@pins/appeals/constants/common.js';

/**
 *
 * @param {string} type
 * @returns
 */
export const isAppealTypeEnabled = (type) => {
	switch (type) {
		case APPEAL_CASE_TYPE.D: {
			return true;
		}
		case APPEAL_CASE_TYPE.W: {
			return isFeatureActive(FEATURE_FLAG_NAMES.SECTION_78);
		}
		case APPEAL_CASE_TYPE.Y: {
			return isFeatureActive(FEATURE_FLAG_NAMES.SECTION_20);
		}

		case APPEAL_CASE_TYPE.ZP: {
			return isFeatureActive(FEATURE_FLAG_NAMES.CAS);
		}
	}

	return false;
};

export const getEnabledAppealTypes = () => {
	const enabledAppeals = [APPEAL_CASE_TYPE.D];

	if (isAppealTypeEnabled(APPEAL_CASE_TYPE.W)) {
		enabledAppeals.push(APPEAL_CASE_TYPE.W);
	}
	if (isAppealTypeEnabled(APPEAL_CASE_TYPE.Y)) {
		enabledAppeals.push(APPEAL_CASE_TYPE.Y);
	}

	if (isAppealTypeEnabled(APPEAL_CASE_TYPE.ZP)) {
		enabledAppeals.push(APPEAL_CASE_TYPE.ZP);
	}

	return enabledAppeals;
};
