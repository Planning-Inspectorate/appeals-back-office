import { APPEAL_CASE_TYPE } from '@planning-inspectorate/data-model';
import { APPEAL_TYPE } from '../constants/common.js';

/**
 *
 * @param {Date} date
 * @param {Date} afterDate
 * @returns {boolean}
 */
export const dateIsAfterDate = (date, afterDate) => {
	return date.getTime() >= afterDate.getTime();
};

/**
 * @typedef {typeof APPEAL_CASE_TYPE['D'] | typeof APPEAL_CASE_TYPE['W']} BaseAppealType
 * @typedef {Record<string, BaseAppealType>} BaseCaseType
 */

/** @type {BaseCaseType} */
const baseCaseType = {
	[APPEAL_CASE_TYPE.D]: APPEAL_CASE_TYPE.D,
	[APPEAL_CASE_TYPE.ZP]: APPEAL_CASE_TYPE.D,
	[APPEAL_CASE_TYPE.ZA]: APPEAL_CASE_TYPE.D,
	[APPEAL_CASE_TYPE.H]: APPEAL_CASE_TYPE.W,
	[APPEAL_CASE_TYPE.W]: APPEAL_CASE_TYPE.W,
	[APPEAL_CASE_TYPE.Y]: APPEAL_CASE_TYPE.W,
	[APPEAL_CASE_TYPE.C]: APPEAL_CASE_TYPE.W,
	[APPEAL_CASE_TYPE.X]: APPEAL_CASE_TYPE.W,
	[APPEAL_CASE_TYPE.F]: APPEAL_CASE_TYPE.W
};

/**
 * @param {string | null} appealType
 * @returns {boolean}
 */
export const isExpeditedAppealType = (appealType) => {
	if (appealType === '') return false;

	if (!appealType || !baseCaseType[appealType]) {
		throw new Error(
			`Appeal type - ${appealType} not defined in isExpeditedAppealType baseCaseType`
		);
	}
	return Boolean(baseCaseType[appealType] === APPEAL_CASE_TYPE.D);
};

/**
 * @param {string | null} appealType
 * @param {string} caseSubmissionDate
 * @param {string} applicationDecision
 * @returns {boolean}
 */
export const isS78ExpeditedAppealType = (appealType, caseSubmissionDate, applicationDecision) => {
	if (!appealType) return false;
	if (
		(appealType === APPEAL_CASE_TYPE.W || appealType === APPEAL_TYPE.S78) &&
		dateIsAfterDate(new Date(caseSubmissionDate), new Date(2026, 3, 1)) &&
		(applicationDecision === 'refused' || applicationDecision === 'granted')
	) {
		return true;
	}
	return false;
};

/**
 *
 * @param {string|undefined} caseType
 * @returns {boolean}
 */
export const isEnforcementCaseType = (caseType) =>
	caseType === APPEAL_CASE_TYPE.C || caseType === APPEAL_CASE_TYPE.F;

/**
 *
 * @param {string|undefined} appealType
 * @returns {boolean}
 */
export const isAnyEnforcementAppealType = (appealType) =>
	appealType === APPEAL_TYPE.ENFORCEMENT_NOTICE ||
	appealType === APPEAL_TYPE.ENFORCEMENT_LISTED_BUILDING;

/**
 *
 * @param {string|undefined} caseType
 * @returns {boolean}
 */
export const isLdcOrDiscontinuanceOrEnforcementCaseType = (caseType) =>
	caseType === APPEAL_CASE_TYPE.X ||
	caseType === APPEAL_CASE_TYPE.G ||
	isEnforcementCaseType(caseType);
