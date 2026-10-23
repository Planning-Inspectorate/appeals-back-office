import config from '@pins/appeals.web/environment/config.js';
import { GENERIC_APPEAL_TYPES } from '@pins/appeals/constants/common.js';
import {
	appealCaseTypeToAppealTypeMapper,
	appealTypeToAppealCaseTypeMapper
} from '@pins/appeals/utils/appeal-type-case.mapper.js';
import { isGenericAppealType } from '@pins/appeals/utils/appeal-type-checks.js';
import { APPEAL_CASE_TYPE } from '@planning-inspectorate/data-model';

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
			return true;
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
		case APPEAL_CASE_TYPE.F: {
			return true;
		}
		case APPEAL_CASE_TYPE.C: {
			return true;
		}
		case APPEAL_CASE_TYPE.X: {
			return true;
		}
	}

	return false;
};

/**
 *
 * @param {string|undefined} appealType
 * @returns boolean
 */
// TODO: update once case type letters and schema are provided by ODW
export const isAppealTypeEnabled = (appealType) => {
	if (isGenericAppealType(appealType)) {
		return Boolean(config.featureFlags.featureFlagGenericCase);
	}
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
	if (isAppealTypeEnabled(GENERIC_APPEAL_TYPES.TREE_PRESERVATION_ORDER)) {
		enabledAppeals.push(GENERIC_APPEAL_TYPES.TREE_PRESERVATION_ORDER);
	}
	if (isAppealTypeEnabled(GENERIC_APPEAL_TYPES.TREE_REPLACEMENT_NOTICE)) {
		enabledAppeals.push(GENERIC_APPEAL_TYPES.TREE_REPLACEMENT_NOTICE);
	}
	if (isAppealTypeEnabled(GENERIC_APPEAL_TYPES.HIGH_HEDGES)) {
		enabledAppeals.push(GENERIC_APPEAL_TYPES.HIGH_HEDGES);
	}
	if (isAppealTypeEnabled(GENERIC_APPEAL_TYPES.HEDGEROWS)) {
		enabledAppeals.push(GENERIC_APPEAL_TYPES.HEDGEROWS);
	}
	if (isAppealTypeEnabled(GENERIC_APPEAL_TYPES.DISCONTINUANCE_NOTICE)) {
		enabledAppeals.push(GENERIC_APPEAL_TYPES.DISCONTINUANCE_NOTICE);
	}
	if (isAppealTypeEnabled(GENERIC_APPEAL_TYPES.COMMUNITY_INFRASTRUCTURE_LEVY)) {
		// @ts-ignore
		enabledAppeals.push(APPEAL_CASE_TYPE.L);
	}
	if (isAppealTypeEnabled(GENERIC_APPEAL_TYPES.SECTION_106_AGREEMENT)) {
		enabledAppeals.push(GENERIC_APPEAL_TYPES.SECTION_106_AGREEMENT);
	}
	if (isAppealTypeEnabled(GENERIC_APPEAL_TYPES.ENVIRONMENTAL)) {
		enabledAppeals.push(GENERIC_APPEAL_TYPES.ENVIRONMENTAL);
	}

	return enabledAppeals;
};
