import { FEATURE_FLAG_NAMES } from '@pins/appeals/constants/common.js';
import {
	appealCaseTypeToAppealTypeMapper,
	appealTypeToAppealCaseTypeMapper
} from '@pins/appeals/utils/appeal-type-case.mapper.js';
import { APPEAL_CASE_TYPE } from '@planning-inspectorate/data-model';
import { isFeatureActive } from './feature-flags.js';

/**
 *
 * @param {string} appealCaseType
 * @returns boolean
 */
export const isAppealCaseTypeEnabled = (appealCaseType) => {
	switch (appealCaseType) {
		case APPEAL_CASE_TYPE.D: {
			return true;
		}
		case APPEAL_CASE_TYPE.W: {
			return isFeatureActive(FEATURE_FLAG_NAMES.SECTION_78);
		}
		case APPEAL_CASE_TYPE.Y: {
			return true;
		}
		case APPEAL_CASE_TYPE.ZP: {
			return true;
		}
		case APPEAL_CASE_TYPE.ZA: {
			return true;
		}
		case APPEAL_CASE_TYPE.H: {
			return true;
		}
		case APPEAL_CASE_TYPE.C: {
			return isFeatureActive(FEATURE_FLAG_NAMES.ENFORCEMENT_NOTICE);
		}
		case APPEAL_CASE_TYPE.X: {
			return isFeatureActive(FEATURE_FLAG_NAMES.LDC);
		}
	}

	return false;
};

/**
 *
 * @param {string} appealType
 * @returns boolean
 */
export const isAppealTypeEnabled = (appealType) => {
	return isAppealCaseTypeEnabled(appealTypeToAppealCaseTypeMapper(appealType));
};

export const getEnabledAppealTypes = () => {
	const enabledAppealCaseTypes = getEnabledAppealCaseTypes();
	return enabledAppealCaseTypes.map(appealCaseTypeToAppealTypeMapper);
};

export const getEnabledAppealCaseTypes = () => {
	const enabledAppeals = [
		APPEAL_CASE_TYPE.D,
		APPEAL_CASE_TYPE.Y,
		APPEAL_CASE_TYPE.ZP,
		APPEAL_CASE_TYPE.ZA,
		APPEAL_CASE_TYPE.H,
		APPEAL_CASE_TYPE.F
	];

	if (isAppealCaseTypeEnabled(APPEAL_CASE_TYPE.W)) {
		// @ts-ignore
		enabledAppeals.push(APPEAL_CASE_TYPE.W);
	}
	if (isAppealCaseTypeEnabled(APPEAL_CASE_TYPE.C)) {
		// @ts-ignore
		enabledAppeals.push(APPEAL_CASE_TYPE.C);
	}
	if (isAppealCaseTypeEnabled(APPEAL_CASE_TYPE.X)) {
		// @ts-ignore
		enabledAppeals.push(APPEAL_CASE_TYPE.X);
	}

	return enabledAppeals;
};
