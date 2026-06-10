import {
	APPEAL_APPLICATION_DECISION,
	APPEAL_CASE_PROCEDURE,
	APPEAL_CASE_TYPE,
	APPEAL_TYPE_OF_PLANNING_APPLICATION
} from '@planning-inspectorate/data-model';
import { APPEAL_TYPE } from '../constants/common.js';
import { EXPEDITED_ORIGINAL_APPLICATION_CUTOFF } from '../constants/dates.js';

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
 * Returns true if the original application was submitted before the expedited process start date
 * of 1st April 2026, or if the application date is null or undefined
 * @param {string | null | undefined} applicationDate
 * @returns {boolean}
 */
export const beforeExpeditedOriginalApplicationCutOff = (applicationDate) => {
	return (
		!applicationDate ||
		!dateIsAfterDate(new Date(applicationDate), EXPEDITED_ORIGINAL_APPLICATION_CUTOFF)
	);
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
 * @param {string} typeOfPlanningApplication
 * @returns {boolean}
 */
export const isS78ExpeditedAppealType = (
	appealType,
	caseSubmissionDate,
	applicationDecision,
	typeOfPlanningApplication
) => {
	if (!appealType) return false;
	if (
		(appealType === APPEAL_CASE_TYPE.W || appealType === APPEAL_TYPE.S78) &&
		dateIsAfterDate(new Date(caseSubmissionDate), new Date(2026, 3, 1)) &&
		(applicationDecision === APPEAL_APPLICATION_DECISION.REFUSED ||
			applicationDecision === APPEAL_APPLICATION_DECISION.GRANTED) &&
		(typeOfPlanningApplication === APPEAL_TYPE_OF_PLANNING_APPLICATION.FULL_APPEAL ||
			typeOfPlanningApplication === APPEAL_TYPE_OF_PLANNING_APPLICATION.OUTLINE_PLANNING ||
			typeOfPlanningApplication === APPEAL_TYPE_OF_PLANNING_APPLICATION.RESERVED_MATTERS)
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

/**
 * @param {string | null | undefined} procedureType
 * @returns {string | null | undefined}
 */
export const normalizeProcedureType = (procedureType) => {
	if (
		procedureType === APPEAL_CASE_PROCEDURE.WRITTEN_PART_1 ||
		procedureType === APPEAL_CASE_PROCEDURE.WRITTEN_PART_2
	) {
		return APPEAL_CASE_PROCEDURE.WRITTEN;
	}
	return procedureType;
};
