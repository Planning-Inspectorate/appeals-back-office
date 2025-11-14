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
			return isFeatureActive(FEATURE_FLAG_NAMES.SECTION_20);
		}
		case APPEAL_CASE_TYPE.ZP: {
			return isFeatureActive(FEATURE_FLAG_NAMES.CAS);
		}
		case APPEAL_CASE_TYPE.ZA: {
			return isFeatureActive(FEATURE_FLAG_NAMES.CAS_ADVERT);
		}
		case APPEAL_CASE_TYPE.H: {
			return isFeatureActive(FEATURE_FLAG_NAMES.ADVERTISEMENT);
		}
		case APPEAL_CASE_TYPE.C: {
			return isFeatureActive(FEATURE_FLAG_NAMES.ENFORCEMENT_NOTICE);
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
	const enabledAppeals = [APPEAL_CASE_TYPE.D];

	if (isAppealCaseTypeEnabled(APPEAL_CASE_TYPE.W)) {
		enabledAppeals.push(APPEAL_CASE_TYPE.W);
	}
	if (isAppealCaseTypeEnabled(APPEAL_CASE_TYPE.Y)) {
		enabledAppeals.push(APPEAL_CASE_TYPE.Y);
	}
	if (isAppealCaseTypeEnabled(APPEAL_CASE_TYPE.H)) {
		enabledAppeals.push(APPEAL_CASE_TYPE.H);
	}
	if (isAppealCaseTypeEnabled(APPEAL_CASE_TYPE.ZA)) {
		enabledAppeals.push(APPEAL_CASE_TYPE.ZA);
	}
	if (isAppealCaseTypeEnabled(APPEAL_CASE_TYPE.ZP)) {
		enabledAppeals.push(APPEAL_CASE_TYPE.ZP);
	}
	if (isAppealCaseTypeEnabled(APPEAL_CASE_TYPE.C)) {
		enabledAppeals.push(APPEAL_CASE_TYPE.C);
	}

	return enabledAppeals;
};
