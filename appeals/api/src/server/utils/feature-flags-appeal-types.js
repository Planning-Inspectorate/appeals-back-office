import config from '#config/config.js';
import { isGenericAppealType } from '@pins/appeals/utils/appeal-type-checks.js';
import { APPEAL_CASE_TYPE } from '@planning-inspectorate/data-model';

// TODO: update once case type letters and schema are provided by ODW
/**
 * @param {string} [type]
 * @returns {boolean}
 */
export const isAppealTypeEnabled = (type) => {
	if (!type) {
		return false;
	}

	if (isGenericAppealType(type)) {
		return Boolean(config.featureFlags.featureFlagGenericCase);
	}

	switch (type) {
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
		case APPEAL_CASE_TYPE.C: {
			return true;
		}
		case APPEAL_CASE_TYPE.X: {
			return true;
		}
		case APPEAL_CASE_TYPE.F: {
			return true;
		}
	}

	return false;
};

export const getEnabledAppealTypes = () => {
	const enabledAppeals = [APPEAL_CASE_TYPE.D];

	if (isAppealTypeEnabled(APPEAL_CASE_TYPE.W)) {
		//@ts-ignore
		enabledAppeals.push(APPEAL_CASE_TYPE.W);
	}
	if (isAppealTypeEnabled(APPEAL_CASE_TYPE.Y)) {
		//@ts-ignore
		enabledAppeals.push(APPEAL_CASE_TYPE.Y);
	}
	if (isAppealTypeEnabled(APPEAL_CASE_TYPE.ZP)) {
		//@ts-ignore
		enabledAppeals.push(APPEAL_CASE_TYPE.ZP);
	}
	if (isAppealTypeEnabled(APPEAL_CASE_TYPE.ZA)) {
		//@ts-ignore
		enabledAppeals.push(APPEAL_CASE_TYPE.ZA);
	}
	if (isAppealTypeEnabled(APPEAL_CASE_TYPE.H)) {
		//@ts-ignore
		enabledAppeals.push(APPEAL_CASE_TYPE.H);
	}
	if (isAppealTypeEnabled(APPEAL_CASE_TYPE.C)) {
		//@ts-ignore
		enabledAppeals.push(APPEAL_CASE_TYPE.C);
	}
	if (isAppealTypeEnabled(APPEAL_CASE_TYPE.X)) {
		//@ts-ignore
		enabledAppeals.push(APPEAL_CASE_TYPE.X);
	}
	if (isAppealTypeEnabled(APPEAL_CASE_TYPE.F)) {
		//@ts-ignore
		enabledAppeals.push(APPEAL_CASE_TYPE.F);
	}

	return enabledAppeals;
};

/**
 * @param {import('@pins/appeals.api').Schema.AppealType[]} appealTypes
 */
export const filterEnabledAppealTypes = (appealTypes) => {
	const enabledAppealTypes = getEnabledAppealTypes();

	return appealTypes.filter((appealType) => {
		//@ts-ignore
		return enabledAppealTypes.includes(appealType.key);
	}, []);
};

// TODO: update once case type letters and schema are provided by ODW
/**
 * @param {any} appeal
 * @returns {boolean}
 */
export const isAppealEnabled = (appeal) => {
	const isGeneric = Boolean(
		appeal?.appealType?.type && isGenericAppealType(appeal.appealType.type)
	);

	if (isGeneric) {
		return Boolean(config.featureFlags.featureFlagGenericCase);
	}

	return isAppealTypeEnabled(appeal?.appealType?.key || '');
};
