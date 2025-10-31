import { APPEAL_TYPE, FEATURE_FLAG_NAMES } from '@pins/appeals/constants/common.js';
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
	if (isAppealCaseTypeEnabled(APPEAL_CASE_TYPE.ZA)) {
		enabledAppeals.push(APPEAL_CASE_TYPE.ZA);
	}
	if (isAppealCaseTypeEnabled(APPEAL_CASE_TYPE.ZP)) {
		enabledAppeals.push(APPEAL_CASE_TYPE.ZP);
	}
	if (isAppealCaseTypeEnabled(APPEAL_CASE_TYPE.H)) {
		enabledAppeals.push(APPEAL_CASE_TYPE.H);
	}
	if (isAppealCaseTypeEnabled(APPEAL_CASE_TYPE.C)) {
		enabledAppeals.push(APPEAL_CASE_TYPE.C);
	}

	return enabledAppeals;
};

/**
 *
 * @param {string} appealType
 * @returns string
 */
export const appealTypeToAppealCaseTypeMapper = (appealType) => {
	switch (appealType) {
		case APPEAL_TYPE.HOUSEHOLDER:
			return APPEAL_CASE_TYPE.D;
		case APPEAL_TYPE.ENFORCEMENT_NOTICE:
			return APPEAL_CASE_TYPE.C;
		case APPEAL_TYPE.ENFORCEMENT_LISTED_BUILDING:
			return APPEAL_CASE_TYPE.F;
		case APPEAL_TYPE.DISCONTINUANCE_NOTICE:
			return APPEAL_CASE_TYPE.G;
		case APPEAL_TYPE.ADVERTISEMENT:
			return APPEAL_CASE_TYPE.H;
		case APPEAL_TYPE.COMMUNITY_INFRASTRUCTURE_LEVY:
			return APPEAL_CASE_TYPE.L;
		case APPEAL_TYPE.PLANNING_OBLIGATION:
			return APPEAL_CASE_TYPE.Q;
		case APPEAL_TYPE.AFFORDABLE_HOUSING_OBLIGATION:
			return APPEAL_CASE_TYPE.S;
		case APPEAL_TYPE.CALL_IN_APPLICATION:
			return APPEAL_CASE_TYPE.V;
		case APPEAL_TYPE.S78:
			return APPEAL_CASE_TYPE.W;
		case APPEAL_TYPE.LAWFUL_DEVELOPMENT_CERTIFICATE:
			return APPEAL_CASE_TYPE.X;
		case APPEAL_TYPE.PLANNED_LISTED_BUILDING:
			return APPEAL_CASE_TYPE.Y;
		case APPEAL_TYPE.CAS_ADVERTISEMENT:
			return APPEAL_CASE_TYPE.ZA;
		case APPEAL_TYPE.CAS_PLANNING:
			return APPEAL_CASE_TYPE.ZP;
		default:
			return '';
	}
};

/**
 *
 * @param {string} appealCaseType
 * @returns string
 */
export const appealCaseTypeToAppealTypeMapper = (appealCaseType) => {
	switch (appealCaseType) {
		case APPEAL_CASE_TYPE.D:
			return APPEAL_TYPE.HOUSEHOLDER;
		case APPEAL_CASE_TYPE.C:
			return APPEAL_TYPE.ENFORCEMENT_NOTICE;
		case APPEAL_CASE_TYPE.F:
			return APPEAL_TYPE.ENFORCEMENT_LISTED_BUILDING;
		case APPEAL_CASE_TYPE.G:
			return APPEAL_TYPE.DISCONTINUANCE_NOTICE;
		case APPEAL_CASE_TYPE.H:
			return APPEAL_TYPE.ADVERTISEMENT;
		case APPEAL_CASE_TYPE.L:
			return APPEAL_TYPE.COMMUNITY_INFRASTRUCTURE_LEVY;
		case APPEAL_CASE_TYPE.Q:
			return APPEAL_TYPE.PLANNING_OBLIGATION;
		case APPEAL_CASE_TYPE.S:
			return APPEAL_TYPE.AFFORDABLE_HOUSING_OBLIGATION;
		case APPEAL_CASE_TYPE.V:
			return APPEAL_TYPE.CALL_IN_APPLICATION;
		case APPEAL_CASE_TYPE.W:
			return APPEAL_TYPE.S78;
		case APPEAL_CASE_TYPE.X:
			return APPEAL_TYPE.LAWFUL_DEVELOPMENT_CERTIFICATE;
		case APPEAL_CASE_TYPE.Y:
			return APPEAL_TYPE.PLANNED_LISTED_BUILDING;
		case APPEAL_CASE_TYPE.ZA:
			return APPEAL_TYPE.CAS_ADVERTISEMENT;
		case APPEAL_CASE_TYPE.ZP:
			return APPEAL_TYPE.CAS_PLANNING;
		default:
			return '';
	}
};
