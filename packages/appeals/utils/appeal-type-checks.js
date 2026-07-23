import {
	APPEAL_APPLICATION_DECISION,
	APPEAL_CASE_TYPE,
	APPEAL_TYPE_OF_PLANNING_APPLICATION
} from '@planning-inspectorate/data-model';
import { APPEAL_TYPE } from '../constants/common.js';
import { EXPEDITED_ORIGINAL_APPLICATION_CUTOFF } from '../constants/dates.js';

import { appealTypeToAppealCaseTypeMapper } from './appeal-type-case.mapper.js';
import { dateIsOnOrAfterDate } from './date-utils.js';

/**
 * Returns true if the original application was submitted before the expedited process start date
 * of 1st April 2026, or if the application date is null or undefined
 * @param {string | null | undefined} applicationDate
 * @returns {boolean}
 */
export const beforeExpeditedOriginalApplicationCutOff = (applicationDate) => {
	return (
		!applicationDate ||
		!dateIsOnOrAfterDate(new Date(applicationDate), EXPEDITED_ORIGINAL_APPLICATION_CUTOFF)
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
	if (!appealType || !caseSubmissionDate) return false;

	const isS78 = appealType === APPEAL_CASE_TYPE.W || appealType === APPEAL_TYPE.S78;
	const isAfterCutoff = !beforeExpeditedOriginalApplicationCutOff(caseSubmissionDate);

	if (!isS78 || !isAfterCutoff) {
		return false;
	}

	const isHasOrCas =
		typeOfPlanningApplication ===
			APPEAL_TYPE_OF_PLANNING_APPLICATION.MINOR_COMMERCIAL_DEVELOPMENT ||
		typeOfPlanningApplication === APPEAL_TYPE_OF_PLANNING_APPLICATION.HOUSEHOLDER_PLANNING;

	if (isHasOrCas) {
		return applicationDecision === APPEAL_APPLICATION_DECISION.GRANTED;
	}

	const isEligibleDecision =
		applicationDecision === APPEAL_APPLICATION_DECISION.REFUSED ||
		applicationDecision === APPEAL_APPLICATION_DECISION.GRANTED;

	const isEligiblePlanningApplication =
		typeOfPlanningApplication === APPEAL_TYPE_OF_PLANNING_APPLICATION.FULL_APPEAL ||
		typeOfPlanningApplication === APPEAL_TYPE_OF_PLANNING_APPLICATION.OUTLINE_PLANNING ||
		typeOfPlanningApplication === APPEAL_TYPE_OF_PLANNING_APPLICATION.RESERVED_MATTERS ||
		typeOfPlanningApplication === APPEAL_TYPE_OF_PLANNING_APPLICATION.PRIOR_APPROVAL;

	return isEligibleDecision && isEligiblePlanningApplication;
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
	isEnforcementCaseType(appealTypeToAppealCaseTypeMapper(appealType));

/**
 *
 * @param {string|undefined} appealType
 * @returns {boolean}
 */
export const isLdcOrDiscontinuanceOrEnforcementAppealType = (appealType) =>
	isLdcOrDiscontinuanceOrEnforcementCaseType(appealTypeToAppealCaseTypeMapper(appealType));

/**
 *
 * @param {string|undefined} caseType
 * @returns {boolean}
 */
export const isLdcOrDiscontinuanceOrEnforcementCaseType = (caseType) =>
	isLdcCaseType(caseType) || caseType === APPEAL_CASE_TYPE.G || isEnforcementCaseType(caseType);

/**
 *
 * @param {string|undefined} caseType
 * @returns {boolean}
 */
export const isLdcCaseType = (caseType) => caseType === APPEAL_CASE_TYPE.X;
