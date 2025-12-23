import { FEATURE_FLAG_NAMES } from '@pins/appeals/constants/common.js';
import { APPEAL_CASE_TYPE } from '@planning-inspectorate/data-model';
import { isFeatureActive } from './feature-flags.js';

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
			return true;
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
