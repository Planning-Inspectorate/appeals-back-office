import {
	STATE_TYPE_FINAL,
	VALIDATION_OUTCOME_CANCEL,
	VALIDATION_OUTCOME_COMPLETE,
	VALIDATION_OUTCOME_INCOMPLETE,
	VALIDATION_OUTCOME_INVALID,
	VALIDATION_OUTCOME_VALID
} from '@pins/appeals/constants/support.js';
import { normalizeProcedureType } from '@pins/appeals/utils/appeal-type-checks.js';
import {
	APPEAL_CASE_PROCEDURE,
	APPEAL_CASE_STATUS,
	APPEAL_CASE_TYPE
} from '@planning-inspectorate/data-model';
import { createMachine } from 'xstate';

/**
 * @typedef {import('@planning-inspectorate/data-model').APPEAL_CASE_TYPE} AppealTypeKey
 * @typedef {import('@planning-inspectorate/data-model').APPEAL_CASE_PROCEDURE} ProcedureType
 * @typedef {import('@planning-inspectorate/data-model').APPEAL_CASE_STATUS} CaseStatus
 * @typedef {object} AdditionalCheckObject
 * */

/**
 * @param {AppealTypeKey} appealTypeKey NOTE - at present implementations only pass 'W' or 'D' to this function
 * @param {ProcedureType} procedureType
 * @param {string} currentState
 * @param {boolean} [eventElapsed]
 * @param {boolean} [isLdcOrDiscontinuanceOrEnforcementCaseType]
 */
const createStateMachine = (
	appealTypeKey,
	procedureType,
	currentState,
	eventElapsed = false,
	isLdcOrDiscontinuanceOrEnforcementCaseType = false
) => {
	const normalizedProcedureType = normalizeProcedureType(procedureType);

	return createMachine({
		id: 'appeals-state-machine',
		initial: currentState || APPEAL_CASE_STATUS.ASSIGN_CASE_OFFICER,
		context: {
			appealType: appealTypeKey,
			procedureType,
			eventElapsed
		},
		states: {
			[APPEAL_CASE_STATUS.ASSIGN_CASE_OFFICER]: {
				on: {
					[APPEAL_CASE_STATUS.VALIDATION]: { target: APPEAL_CASE_STATUS.VALIDATION },
					[APPEAL_CASE_STATUS.CLOSED]: { target: APPEAL_CASE_STATUS.CLOSED },
					[APPEAL_CASE_STATUS.AWAITING_TRANSFER]: {
						target: APPEAL_CASE_STATUS.AWAITING_TRANSFER
					},
					[APPEAL_CASE_STATUS.WITHDRAWN]: {
						target: APPEAL_CASE_STATUS.WITHDRAWN
					},
					[VALIDATION_OUTCOME_INVALID]: { target: APPEAL_CASE_STATUS.INVALID }
				},
				meta: {
					validAppealTypes: [APPEAL_CASE_TYPE.D, APPEAL_CASE_TYPE.W],
					validProcedureTypes: [
						APPEAL_CASE_PROCEDURE.WRITTEN,
						APPEAL_CASE_PROCEDURE.HEARING,
						APPEAL_CASE_PROCEDURE.INQUIRY
					]
				}
			},
			[APPEAL_CASE_STATUS.VALIDATION]: {
				on: {
					[VALIDATION_OUTCOME_VALID]: { target: APPEAL_CASE_STATUS.READY_TO_START },
					[VALIDATION_OUTCOME_INVALID]: { target: APPEAL_CASE_STATUS.INVALID },
					[VALIDATION_OUTCOME_INCOMPLETE]: undefined,
					[APPEAL_CASE_STATUS.CLOSED]: { target: APPEAL_CASE_STATUS.CLOSED },
					[APPEAL_CASE_STATUS.AWAITING_TRANSFER]: {
						target: APPEAL_CASE_STATUS.AWAITING_TRANSFER
					},
					[APPEAL_CASE_STATUS.WITHDRAWN]: {
						target: APPEAL_CASE_STATUS.WITHDRAWN
					}
				},
				meta: {
					validAppealTypes: [APPEAL_CASE_TYPE.D, APPEAL_CASE_TYPE.W],
					validProcedureTypes: [
						APPEAL_CASE_PROCEDURE.WRITTEN,
						APPEAL_CASE_PROCEDURE.HEARING,
						APPEAL_CASE_PROCEDURE.INQUIRY
					]
				}
			},
			[APPEAL_CASE_STATUS.READY_TO_START]: {
				on: {
					[APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE]: {
						target: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE
					},
					[APPEAL_CASE_STATUS.CLOSED]: { target: APPEAL_CASE_STATUS.CLOSED },
					[APPEAL_CASE_STATUS.AWAITING_TRANSFER]: {
						target: APPEAL_CASE_STATUS.AWAITING_TRANSFER
					},
					[APPEAL_CASE_STATUS.WITHDRAWN]: {
						target: APPEAL_CASE_STATUS.WITHDRAWN
					},
					[VALIDATION_OUTCOME_INVALID]: { target: APPEAL_CASE_STATUS.INVALID }
				},
				meta: {
					validAppealTypes: [APPEAL_CASE_TYPE.D, APPEAL_CASE_TYPE.W],
					validProcedureTypes: [
						APPEAL_CASE_PROCEDURE.WRITTEN,
						APPEAL_CASE_PROCEDURE.HEARING,
						APPEAL_CASE_PROCEDURE.INQUIRY
					]
				}
			},
			[APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE]: {
				on: {
					[VALIDATION_OUTCOME_COMPLETE]: {
						target: targetStateOnLpaqComplete(appealTypeKey, procedureType, eventElapsed)
					},
					[VALIDATION_OUTCOME_INCOMPLETE]: undefined,
					[APPEAL_CASE_STATUS.CLOSED]: { target: APPEAL_CASE_STATUS.CLOSED },
					[APPEAL_CASE_STATUS.AWAITING_TRANSFER]: {
						target: APPEAL_CASE_STATUS.AWAITING_TRANSFER
					},
					[APPEAL_CASE_STATUS.WITHDRAWN]: {
						target: APPEAL_CASE_STATUS.WITHDRAWN
					},
					[VALIDATION_OUTCOME_INVALID]: { target: APPEAL_CASE_STATUS.INVALID }
				},
				meta: {
					validAppealTypes: [APPEAL_CASE_TYPE.D, APPEAL_CASE_TYPE.W],
					validProcedureTypes: [
						APPEAL_CASE_PROCEDURE.WRITTEN,
						APPEAL_CASE_PROCEDURE.HEARING,
						APPEAL_CASE_PROCEDURE.INQUIRY
					]
				}
			},
			[APPEAL_CASE_STATUS.STATEMENTS]: {
				on: {
					//@ts-ignore
					[VALIDATION_OUTCOME_COMPLETE]: {
						//@ts-ignore
						target: targetStateOnStatementsComplete(
							isLdcOrDiscontinuanceOrEnforcementCaseType,
							normalizedProcedureType
						),
						cond: isAppealTypeAndProcedureTypeValid
					},
					[APPEAL_CASE_STATUS.CLOSED]: {
						target: APPEAL_CASE_STATUS.CLOSED,
						cond: isAppealTypeAndProcedureTypeValid
					},
					[APPEAL_CASE_STATUS.AWAITING_TRANSFER]: {
						target: APPEAL_CASE_STATUS.AWAITING_TRANSFER,
						cond: isAppealTypeAndProcedureTypeValid
					},
					[APPEAL_CASE_STATUS.WITHDRAWN]: {
						target: APPEAL_CASE_STATUS.WITHDRAWN,
						cond: isAppealTypeAndProcedureTypeValid
					},
					[VALIDATION_OUTCOME_INVALID]: { target: APPEAL_CASE_STATUS.INVALID }
				},
				meta: {
					validAppealTypes: [APPEAL_CASE_TYPE.W],
					validProcedureTypes: [
						APPEAL_CASE_PROCEDURE.WRITTEN,
						APPEAL_CASE_PROCEDURE.HEARING,
						APPEAL_CASE_PROCEDURE.INQUIRY
					]
				}
			},
			[APPEAL_CASE_STATUS.FINAL_COMMENTS]: {
				on: {
					[VALIDATION_OUTCOME_COMPLETE]: [
						{
							target: APPEAL_CASE_STATUS.ISSUE_DETERMINATION,
							cond: isEventElapsedAndValid
						},
						{
							target: APPEAL_CASE_STATUS.EVENT,
							cond: isAppealTypeAndProcedureTypeValid
						}
					],
					[APPEAL_CASE_STATUS.CLOSED]: {
						target: APPEAL_CASE_STATUS.CLOSED,
						cond: isAppealTypeAndProcedureTypeValid
					},
					[APPEAL_CASE_STATUS.AWAITING_TRANSFER]: {
						target: APPEAL_CASE_STATUS.AWAITING_TRANSFER,
						cond: isAppealTypeAndProcedureTypeValid
					},
					[APPEAL_CASE_STATUS.WITHDRAWN]: {
						target: APPEAL_CASE_STATUS.WITHDRAWN,
						cond: isAppealTypeAndProcedureTypeValid
					},
					[VALIDATION_OUTCOME_INVALID]: { target: APPEAL_CASE_STATUS.INVALID }
				},
				meta: {
					validAppealTypes: [APPEAL_CASE_TYPE.W],
					validProcedureTypes: finalCommentsValidProcedures(
						isLdcOrDiscontinuanceOrEnforcementCaseType
					)
				}
			},
			[APPEAL_CASE_STATUS.EVENT]: {
				on: {
					[VALIDATION_OUTCOME_COMPLETE]: {
						target: APPEAL_CASE_STATUS.AWAITING_EVENT
					},
					[VALIDATION_OUTCOME_INCOMPLETE]: { target: undefined },
					[APPEAL_CASE_STATUS.CLOSED]: { target: APPEAL_CASE_STATUS.CLOSED },
					[APPEAL_CASE_STATUS.AWAITING_TRANSFER]: {
						target: APPEAL_CASE_STATUS.AWAITING_TRANSFER
					},
					[APPEAL_CASE_STATUS.WITHDRAWN]: {
						target: APPEAL_CASE_STATUS.WITHDRAWN
					},
					[VALIDATION_OUTCOME_INVALID]: { target: APPEAL_CASE_STATUS.INVALID }
				},
				meta: {
					validAppealTypes: [APPEAL_CASE_TYPE.D, APPEAL_CASE_TYPE.W],
					validProcedureTypes: [
						APPEAL_CASE_PROCEDURE.WRITTEN,
						APPEAL_CASE_PROCEDURE.HEARING,
						APPEAL_CASE_PROCEDURE.INQUIRY
					]
				}
			},
			[APPEAL_CASE_STATUS.EVIDENCE]: {
				on: {
					[VALIDATION_OUTCOME_COMPLETE]: {
						target: APPEAL_CASE_STATUS.EVENT,
						cond: isAppealTypeAndProcedureTypeValid
					},
					[VALIDATION_OUTCOME_INCOMPLETE]: {
						target: undefined,
						cond: isAppealTypeAndProcedureTypeValid
					},
					[APPEAL_CASE_STATUS.CLOSED]: {
						target: APPEAL_CASE_STATUS.CLOSED,
						cond: isAppealTypeAndProcedureTypeValid
					},
					[APPEAL_CASE_STATUS.AWAITING_TRANSFER]: {
						target: APPEAL_CASE_STATUS.AWAITING_TRANSFER,
						cond: isAppealTypeAndProcedureTypeValid
					},
					[APPEAL_CASE_STATUS.WITHDRAWN]: {
						target: APPEAL_CASE_STATUS.WITHDRAWN,
						cond: isAppealTypeAndProcedureTypeValid
					},
					[VALIDATION_OUTCOME_INVALID]: { target: APPEAL_CASE_STATUS.INVALID }
				},
				meta: {
					validAppealTypes: [APPEAL_CASE_TYPE.W],
					validProcedureTypes: [APPEAL_CASE_PROCEDURE.INQUIRY]
				}
			},
			[APPEAL_CASE_STATUS.AWAITING_EVENT]: {
				on: {
					//@ts-ignore
					[VALIDATION_OUTCOME_COMPLETE]: {
						target: APPEAL_CASE_STATUS.ISSUE_DETERMINATION,
						cond: isEventElapsedAndValid
					},
					[VALIDATION_OUTCOME_INCOMPLETE]: { target: APPEAL_CASE_STATUS.EVENT },
					//@ts-ignore
					[VALIDATION_OUTCOME_CANCEL]: { target: targetStateOnEventCancelled[procedureType] },
					[APPEAL_CASE_STATUS.CLOSED]: { target: APPEAL_CASE_STATUS.CLOSED },
					[APPEAL_CASE_STATUS.AWAITING_TRANSFER]: {
						target: APPEAL_CASE_STATUS.AWAITING_TRANSFER
					},
					[APPEAL_CASE_STATUS.WITHDRAWN]: {
						target: APPEAL_CASE_STATUS.WITHDRAWN
					},
					[VALIDATION_OUTCOME_INVALID]: { target: APPEAL_CASE_STATUS.INVALID }
				},
				meta: {
					validAppealTypes: [APPEAL_CASE_TYPE.D, APPEAL_CASE_TYPE.W],
					validProcedureTypes: [
						APPEAL_CASE_PROCEDURE.WRITTEN,
						APPEAL_CASE_PROCEDURE.HEARING,
						APPEAL_CASE_PROCEDURE.INQUIRY
					]
				}
			},
			[APPEAL_CASE_STATUS.ISSUE_DETERMINATION]: {
				on: {
					[VALIDATION_OUTCOME_INCOMPLETE]: { target: APPEAL_CASE_STATUS.EVENT },
					[APPEAL_CASE_STATUS.COMPLETE]: { target: APPEAL_CASE_STATUS.COMPLETE },
					[APPEAL_CASE_STATUS.CLOSED]: { target: APPEAL_CASE_STATUS.CLOSED },
					[APPEAL_CASE_STATUS.AWAITING_TRANSFER]: {
						target: APPEAL_CASE_STATUS.AWAITING_TRANSFER
					},
					//@ts-ignore
					[APPEAL_CASE_STATUS.INVALID]: { target: APPEAL_CASE_STATUS.INVALID },
					//@ts-ignore
					[VALIDATION_OUTCOME_INVALID]: { target: APPEAL_CASE_STATUS.INVALID },
					//@ts-ignore
					[APPEAL_CASE_STATUS.INVALID]: { target: APPEAL_CASE_STATUS.INVALID },
					//@ts-ignore
					[APPEAL_CASE_STATUS.WITHDRAWN]: {
						target: APPEAL_CASE_STATUS.WITHDRAWN
					}
				},
				meta: {
					validAppealTypes: [APPEAL_CASE_TYPE.D, APPEAL_CASE_TYPE.W],
					validProcedureTypes: [
						APPEAL_CASE_PROCEDURE.WRITTEN,
						APPEAL_CASE_PROCEDURE.HEARING,
						APPEAL_CASE_PROCEDURE.INQUIRY
					]
				}
			},
			[APPEAL_CASE_STATUS.AWAITING_TRANSFER]: {
				on: {
					[APPEAL_CASE_STATUS.TRANSFERRED]: { target: APPEAL_CASE_STATUS.TRANSFERRED }
				},
				meta: {
					validAppealTypes: [APPEAL_CASE_TYPE.D, APPEAL_CASE_TYPE.W],
					validProcedureTypes: [
						APPEAL_CASE_PROCEDURE.WRITTEN,
						APPEAL_CASE_PROCEDURE.HEARING,
						APPEAL_CASE_PROCEDURE.INQUIRY
					]
				}
			},
			[APPEAL_CASE_STATUS.INVALID]: {
				type: STATE_TYPE_FINAL,
				meta: {
					validAppealTypes: [APPEAL_CASE_TYPE.D, APPEAL_CASE_TYPE.W],
					validProcedureTypes: [
						APPEAL_CASE_PROCEDURE.WRITTEN,
						APPEAL_CASE_PROCEDURE.HEARING,
						APPEAL_CASE_PROCEDURE.INQUIRY
					]
				}
			},
			[APPEAL_CASE_STATUS.TRANSFERRED]: {
				type: STATE_TYPE_FINAL,
				meta: {
					validAppealTypes: [APPEAL_CASE_TYPE.D, APPEAL_CASE_TYPE.W],
					validProcedureTypes: [
						APPEAL_CASE_PROCEDURE.WRITTEN,
						APPEAL_CASE_PROCEDURE.HEARING,
						APPEAL_CASE_PROCEDURE.INQUIRY
					]
				}
			},
			[APPEAL_CASE_STATUS.CLOSED]: {
				type: STATE_TYPE_FINAL,
				meta: {
					validAppealTypes: [APPEAL_CASE_TYPE.D, APPEAL_CASE_TYPE.W],
					validProcedureTypes: [
						APPEAL_CASE_PROCEDURE.WRITTEN,
						APPEAL_CASE_PROCEDURE.HEARING,
						APPEAL_CASE_PROCEDURE.INQUIRY
					]
				}
			},
			[APPEAL_CASE_STATUS.WITHDRAWN]: {
				type: STATE_TYPE_FINAL,
				meta: {
					validAppealTypes: [APPEAL_CASE_TYPE.D, APPEAL_CASE_TYPE.W],
					validProcedureTypes: [
						APPEAL_CASE_PROCEDURE.WRITTEN,
						APPEAL_CASE_PROCEDURE.HEARING,
						APPEAL_CASE_PROCEDURE.INQUIRY
					]
				}
			},
			[APPEAL_CASE_STATUS.COMPLETE]: {
				type: STATE_TYPE_FINAL,
				meta: {
					validAppealTypes: [APPEAL_CASE_TYPE.D, APPEAL_CASE_TYPE.W],
					validProcedureTypes: [
						APPEAL_CASE_PROCEDURE.WRITTEN,
						APPEAL_CASE_PROCEDURE.HEARING,
						APPEAL_CASE_PROCEDURE.INQUIRY
					]
				}
			}
		}
	});
};

/**
 * @typedef {{ appealType: AppealTypeKey, procedureType: string, eventElapsed: boolean }} Ctx
 * @typedef {{ state: { value: string, meta: Record<string, any> } }} State
 * @typedef {import('xstate').EventObject} _evt
 */
/**
 * Checks if the appeal type and procedure type are valid for the current state.
 * @param {Ctx} ctx - The context object containing appealType and procedureType.
 * @param {Object} _evt - The event object (not used in this function).
 * @param {{ state: import('xstate').State<Ctx, any, any, any> }} meta
 * @returns {boolean} - Returns true if the appeal type and procedure type are valid for
 * the current state, otherwise false.
 */
const isAppealTypeAndProcedureTypeValid = (ctx, _evt, { state }) => {
	const meta = state.meta[`appeals-state-machine.${state.value}`];
	const appealType = ctx.appealType;
	let procedureType = ctx.procedureType;

	if (!appealType || !procedureType || !meta) return false;

	procedureType = normalizeProcedureType(procedureType);

	return (
		meta.validAppealTypes.includes(appealType) && meta.validProcedureTypes.includes(procedureType)
	);
};

/**
 * Guard that checks if the site visit has elapsed.
 * @param {Ctx} ctx - The context object containing appealType and procedureType.
 * @returns {boolean}
 */
const isEventElapsed = (ctx) => {
	return ctx.eventElapsed === true;
};

/**
 * Checks if the appeal type and procedure type are valid for the current state.
 * @param {Ctx} ctx - The context object containing appealType and procedureType.
 * @param {Object} _evt - The event object (not used in this function).
 * @param {{ state: import('xstate').State<Ctx, any, any, any> }} meta
 * @returns {boolean} - Returns true if the appeal type and procedure type are valid for
 * the current state, otherwise false.
 */
const isEventElapsedAndValid = (ctx, _evt, meta) => {
	return isAppealTypeAndProcedureTypeValid(ctx, _evt, meta) && isEventElapsed(ctx);
};

const targetStateOnEventCancelled = {
	[APPEAL_CASE_PROCEDURE.HEARING]: APPEAL_CASE_STATUS.EVENT,
	[APPEAL_CASE_PROCEDURE.INQUIRY]: APPEAL_CASE_STATUS.EVENT,
	[APPEAL_CASE_PROCEDURE.WRITTEN]: APPEAL_CASE_STATUS.FINAL_COMMENTS,
	[APPEAL_CASE_PROCEDURE.WRITTEN_PART_1]: APPEAL_CASE_STATUS.EVENT,
	[APPEAL_CASE_PROCEDURE.WRITTEN_PART_2]: APPEAL_CASE_STATUS.EVENT
};

/**
 * Determines the next state after the LPAQ is complete based on the appeal type and procedure type.
 * @param {AppealTypeKey} appealTypeKey
 * @param {ProcedureType} procedureType
 * @param {boolean} [eventElapsed]
 * @returns {CaseStatus}
 */
const targetStateOnLpaqComplete = (appealTypeKey, procedureType, eventElapsed = false) => {
	if (
		appealTypeKey === APPEAL_CASE_TYPE.D ||
		procedureType === APPEAL_CASE_PROCEDURE.WRITTEN_PART_1
	) {
		return eventElapsed ? APPEAL_CASE_STATUS.ISSUE_DETERMINATION : APPEAL_CASE_STATUS.EVENT;
	}
	return APPEAL_CASE_STATUS.STATEMENTS;
};

const nonLdcEnfDiscStatementsTargetState = {
	[APPEAL_CASE_PROCEDURE.WRITTEN]: APPEAL_CASE_STATUS.FINAL_COMMENTS,
	[APPEAL_CASE_PROCEDURE.HEARING]: APPEAL_CASE_STATUS.EVENT,
	[APPEAL_CASE_PROCEDURE.INQUIRY]: APPEAL_CASE_STATUS.EVIDENCE
};

/**
 * Determines the next state after statements are complete based on the appeal type and procedure type.
 * @param {boolean} isLdcOrDiscontinuanceOrEnforcementCaseType
 * @param {ProcedureType} procedureType
 * @returns {CaseStatus}
 */
const targetStateOnStatementsComplete = (
	isLdcOrDiscontinuanceOrEnforcementCaseType,
	procedureType
) => {
	return isLdcOrDiscontinuanceOrEnforcementCaseType
		? //@ts-ignore
			APPEAL_CASE_STATUS.FINAL_COMMENTS
		: //@ts-ignore
			nonLdcEnfDiscStatementsTargetState[procedureType];
};

/**
 * Determines the next state after statements are complete based on the appeal type and procedure type.
 * @param {boolean} isLdcOrDiscontinuanceOrEnforcementCaseType
 * @returns {ProcedureType[]}
 */
const finalCommentsValidProcedures = (isLdcOrDiscontinuanceOrEnforcementCaseType) => {
	return isLdcOrDiscontinuanceOrEnforcementCaseType
		? [APPEAL_CASE_PROCEDURE.WRITTEN, APPEAL_CASE_PROCEDURE.HEARING, APPEAL_CASE_PROCEDURE.INQUIRY]
		: [APPEAL_CASE_PROCEDURE.WRITTEN];
};

export default createStateMachine;
