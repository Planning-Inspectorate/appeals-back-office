import config from '#config/config.js';
import { appealTypeToAppealCaseTypeMapper } from '@pins/appeals/utils/appeal-type-case.mapper.js';
import { isGenericAppealType } from '@pins/appeals/utils/appeal-type-checks.js';
import { APPEAL_CASE_TYPE } from '@planning-inspectorate/data-model';

/**
 * @param {string | null | undefined} [appealCaseType]
 * @returns {boolean}
 */
export const isAppealCaseTypeEnabled = (appealCaseType) => {
	if (!appealCaseType) {
		return false;
	}

	switch (appealCaseType) {
		case APPEAL_CASE_TYPE.D:
		case APPEAL_CASE_TYPE.W:
		case APPEAL_CASE_TYPE.Y:
		case APPEAL_CASE_TYPE.ZP:
		case APPEAL_CASE_TYPE.ZA:
		case APPEAL_CASE_TYPE.H:
		case APPEAL_CASE_TYPE.C:
		case APPEAL_CASE_TYPE.X:
		case APPEAL_CASE_TYPE.F:
			return true;
		case APPEAL_CASE_TYPE.G:
		case APPEAL_CASE_TYPE.L:
		case APPEAL_CASE_TYPE.Q:
		case APPEAL_CASE_TYPE.TPO:
		case APPEAL_CASE_TYPE.TRN:
		case APPEAL_CASE_TYPE.HH:
		case APPEAL_CASE_TYPE.HR:
		case APPEAL_CASE_TYPE.ENV:
			return Boolean(config.featureFlags.featureFlagGenericCase);
	}

	return false;
};

/**
 * @param {string | null | undefined} [type]
 * @returns {boolean}
 */
export const isAppealTypeEnabled = (type) => {
	if (!type) {
		return false;
	}

	if (isGenericAppealType(type)) {
		return Boolean(config.featureFlags.featureFlagGenericCase);
	}

	return isAppealCaseTypeEnabled(appealTypeToAppealCaseTypeMapper(type) || type);
};

const ALL_APPEAL_CASE_TYPES = [
	APPEAL_CASE_TYPE.D,
	APPEAL_CASE_TYPE.W,
	APPEAL_CASE_TYPE.Y,
	APPEAL_CASE_TYPE.ZP,
	APPEAL_CASE_TYPE.ZA,
	APPEAL_CASE_TYPE.H,
	APPEAL_CASE_TYPE.C,
	APPEAL_CASE_TYPE.X,
	APPEAL_CASE_TYPE.F,
	APPEAL_CASE_TYPE.G,
	APPEAL_CASE_TYPE.L,
	APPEAL_CASE_TYPE.Q,
	APPEAL_CASE_TYPE.TPO,
	APPEAL_CASE_TYPE.TRN,
	APPEAL_CASE_TYPE.HH,
	APPEAL_CASE_TYPE.HR,
	APPEAL_CASE_TYPE.ENV
];

export const getEnabledAppealTypes = () => ALL_APPEAL_CASE_TYPES.filter(isAppealCaseTypeEnabled);

export const getEnabledAppealCaseTypes = getEnabledAppealTypes;

/**
 * @param {import('@pins/appeals.api').Schema.AppealType[]} appealTypes
 */
export const filterEnabledAppealTypes = (appealTypes) => {
	const enabledAppealTypes = getEnabledAppealTypes();

	return appealTypes.filter((appealType) => {
		//@ts-ignore
		return enabledAppealTypes.includes(appealType.key);
	});
};

/**
 * @param {any} appeal
 * @returns {boolean}
 */
export const isAppealEnabled = (appeal) => {
	return isAppealTypeEnabled(appeal?.appealType?.key || appeal?.appealType?.type || '');
};
