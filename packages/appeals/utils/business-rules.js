import { isAnyEnforcementAppealType } from '@pins/appeals/utils/appeal-type-checks.js';
import {
	APPEAL_CASE_PROCEDURE,
	APPEAL_CASE_STATUS,
	APPEAL_CASE_TYPE
} from '@planning-inspectorate/data-model';
import { APPEAL_TYPE, PROCEDURE_TYPE_NAME } from '../constants/common.js';
import {
	isLdcOrDiscontinuanceOrEnforcementAppealType,
	isLdcOrEnforcementAppealType
} from './appeal-type-checks.js';
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
		procedureType?.toLowerCase() !== APPEAL_CASE_PROCEDURE.INQUIRY &&
		procedureType !== APPEAL_CASE_PROCEDURE.WRITTEN_PART_1 &&
		procedureType !== PROCEDURE_TYPE_NAME.WRITTEN_PART_1);

/**
 * Checks if an expedited S78 appeal can have its procedure changed.
 * Allows changes when feature flag is active, appeal type is S78, the procedure is Part 1 / writtenPart1, and at an allowed stage.
 * @param {Object} params
 * @param {string | null | undefined} [params.appealType]
 * @param {string | undefined} params.procedureType
 * @param {string | undefined} [params.currentStage]
 * @param {boolean} [params.isExpeditedCopFeatureActive]
 * @returns {boolean}
 */
export const canChangeS78ExpeditedAppealProcedure = ({
	appealType,
	procedureType,
	currentStage,
	isExpeditedCopFeatureActive = false
}) => {
	if (!isExpeditedCopFeatureActive) {
		return false;
	}

	if (appealType && appealType !== APPEAL_TYPE.S78 && appealType !== APPEAL_CASE_TYPE.W) {
		return false;
	}

	const normalised = procedureType?.toLowerCase();
	if (normalised !== PROCEDURE_TYPE_NAME.WRITTEN_PART_1.toLowerCase()) {
		return false;
	}

	return [APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE].includes(/** @type {any} */ (currentStage));
};

/**
 * Checks if an expedited appeal can change to a specific target procedure type at the current stage.
 * Update based on allowed stages for changing procedure type
 * @param {Object} params
 * @param {string} params.targetProcedure
 * @param {string | null | undefined} params.appealType
 * @param {string | undefined} params.currentProcedureType
 * @param {string | undefined} [params.currentStage]
 * @param {boolean} [params.isExpeditedCopFeatureActive]
 * @returns {boolean}
 */
export const canChangeS78ExpeditedToTargetProcedure = ({
	targetProcedure,
	appealType,
	currentProcedureType,
	currentStage,
	isExpeditedCopFeatureActive = false
}) => {
	if (
		!canChangeS78ExpeditedAppealProcedure({
			appealType,
			procedureType: currentProcedureType,
			currentStage,
			isExpeditedCopFeatureActive
		})
	) {
		return false;
	}

	switch (targetProcedure) {
		case APPEAL_CASE_PROCEDURE.WRITTEN:
			// Stage 1: Up to LPAQ complete allows changing to Written
			return [APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE].includes(/** @type {any} */ (currentStage));
		case APPEAL_CASE_PROCEDURE.HEARING:
			// Future Dev Work: Hearing
			return false;
		case APPEAL_CASE_PROCEDURE.INQUIRY:
			// Future Dev Work: Inquiry
			return false;
		default:
			return false;
	}
};

// display planning obligation when it 'hasObligation' for any procedure type for enforcement appeal types
// and only hearing and inquiry otherwise
/**
 * @param {string | undefined} appealType
 * @param {string | undefined} procedureType
 * @param {boolean | undefined} hasObligation
 * @returns {boolean}
 */
export const displayPlanningObligation = (appealType, procedureType, hasObligation) =>
	(isAnyEnforcementAppealType(appealType) ||
		[APPEAL_CASE_PROCEDURE.HEARING, APPEAL_CASE_PROCEDURE.INQUIRY].includes(
			// @ts-ignore
			procedureType?.toLowerCase() ?? ''
		)) &&
	hasObligation;

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
 * @param {boolean} isHearingSetup
 * @returns {string}
 */
export function getNextStateOnStatementsComplete(appealType, procedureType, isHearingSetup) {
	const normalisedProcedureType = normaliseProcedureType(procedureType);

	const nextState = targetStateOnStatementsComplete(
		isLdcOrDiscontinuanceOrEnforcementAppealType(appealType),
		normalisedProcedureType
	);

	// currently the target state will only be event if the procedure type is hearing
	// if the hearing has already been set up then the eventual state will actually be awaiting event
	const eventualState =
		isHearingSetup && nextState === APPEAL_CASE_STATUS.EVENT
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

/**
 * Uses appeal type to determine whether we should be sending notifies for unaccompanied site visits
 * We don't send them for enforcement, ELB or LDC
 * @param {string} appealType
 * @returns {boolean}
 */
export const sendSiteVisitScheduleUnaccompaniedNotify = (appealType) => {
	return !isLdcOrEnforcementAppealType(appealType);
};
