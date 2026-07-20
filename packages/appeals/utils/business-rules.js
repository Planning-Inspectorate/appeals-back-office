import {
	APPEAL_CASE_PROCEDURE,
	APPEAL_CASE_STATUS,
	APPEAL_CASE_TYPE
} from '@planning-inspectorate/data-model';
import { isLdcOrDiscontinuanceOrEnforcementAppealType } from './appeal-type-checks.js';
import { normaliseProcedureType } from './procedure-type.js';

/**
 * @typedef {import('@planning-inspectorate/data-model').APPEAL_CASE_TYPE} AppealTypeKey
 * @typedef {import('@planning-inspectorate/data-model').APPEAL_CASE_PROCEDURE} ProcedureType
 * @typedef {import('@planning-inspectorate/data-model').APPEAL_CASE_STATUS} CaseStatus
 * @typedef {object} AdditionalCheckObject
 * */

/**
 * @param {string | undefined} appealType
 * @param {string | undefined} procedureType
 * @returns {boolean}
 */
export const displayFinalComments = (appealType, procedureType) =>
	isLdcOrDiscontinuanceOrEnforcementAppealType(appealType) ||
	(procedureType?.toLowerCase() !== APPEAL_CASE_PROCEDURE.HEARING &&
		procedureType?.toLowerCase() !== APPEAL_CASE_PROCEDURE.INQUIRY);

/**
 * Determines the next state after the LPAQ is complete based on the appeal type and procedure type.
 * @param {AppealTypeKey} appealTypeKey NOTE - at present implementations only pass 'W' or 'D' to this function
 * @param {ProcedureType} procedureType
 * @param {boolean} [eventElapsed]
 * @returns {CaseStatus}
 */
export const targetStateOnLpaqComplete = (appealTypeKey, procedureType, eventElapsed = false) => {
	if (
		appealTypeKey === APPEAL_CASE_TYPE.D ||
		procedureType === APPEAL_CASE_PROCEDURE.WRITTEN_PART_1
	) {
		return eventElapsed ? APPEAL_CASE_STATUS.ISSUE_DETERMINATION : APPEAL_CASE_STATUS.EVENT;
	}
	return APPEAL_CASE_STATUS.STATEMENTS;
};

/**
 * Determines the next state after statements are complete based on the appeal type and normalised procedure type.
 * Note that this is used in the state machine and so this may not be the final state it ends up in, but the next state after statements are complete.
 * @param {boolean} isLdcOrDiscontinuanceOrEnforcementCaseType
 * @param {ProcedureType} normalisedProcedureType
 * @returns {CaseStatus}
 */
export const targetStateOnStatementsComplete = (
	isLdcOrDiscontinuanceOrEnforcementCaseType,
	normalisedProcedureType
) => {
	return isLdcOrDiscontinuanceOrEnforcementCaseType
		? //@ts-ignore
			APPEAL_CASE_STATUS.FINAL_COMMENTS
		: //@ts-ignore
			nonLdcEnfDiscStatementsTargetState[normalisedProcedureType];
};

/**
 * Uses appeal information to determine the next status on statements complete
 * @param {string} appealType
 * @param {string} procedureType
 * @param {boolean} isHearingSetUp
 * @returns {string}
 */
export function getNextStateOnStatementsComplete(appealType, procedureType, isHearingSetUp) {
	const normalisedProcedureType = normaliseProcedureType(procedureType);

	const nextState = targetStateOnStatementsComplete(
		isLdcOrDiscontinuanceOrEnforcementAppealType(appealType),
		normalisedProcedureType
	);

	// currently the target state will only be event if the procedure type is hearing
	// if the hearing has already been set up then the eventual state will actually be awaiting event
	const eventualState =
		isHearingSetUp && nextState === APPEAL_CASE_STATUS.EVENT
			? APPEAL_CASE_STATUS.AWAITING_EVENT
			: nextState;

	return eventualState;
}

const nonLdcEnfDiscStatementsTargetState = {
	[APPEAL_CASE_PROCEDURE.WRITTEN]: APPEAL_CASE_STATUS.FINAL_COMMENTS,
	[APPEAL_CASE_PROCEDURE.HEARING]: APPEAL_CASE_STATUS.EVENT,
	[APPEAL_CASE_PROCEDURE.INQUIRY]: APPEAL_CASE_STATUS.EVIDENCE
};

export const targetStateOnEventCancelled = {
	[APPEAL_CASE_PROCEDURE.HEARING]: APPEAL_CASE_STATUS.EVENT,
	[APPEAL_CASE_PROCEDURE.INQUIRY]: APPEAL_CASE_STATUS.EVENT,
	[APPEAL_CASE_PROCEDURE.WRITTEN]: APPEAL_CASE_STATUS.FINAL_COMMENTS,
	[APPEAL_CASE_PROCEDURE.WRITTEN_PART_1]: APPEAL_CASE_STATUS.EVENT,
	[APPEAL_CASE_PROCEDURE.WRITTEN_PART_2]: APPEAL_CASE_STATUS.EVENT
};
