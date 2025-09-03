import { createMachine } from 'xstate';
import { APPEAL_CASE_STATUS, APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';
import {
	APPEAL_TYPE_SHORTHAND_HAS,
	APPEAL_TYPE_SHORTHAND_FPA,
	STATE_TYPE_FINAL,
	VALIDATION_OUTCOME_COMPLETE,
	VALIDATION_OUTCOME_INCOMPLETE,
	VALIDATION_OUTCOME_INVALID,
	VALIDATION_OUTCOME_VALID
} from '@pins/appeals/constants/support.js';
import { VALIDATION_OUTCOME_CANCEL } from '@pins/appeals/constants/support.js';

/**
 * @typedef {import('@planning-inspectorate/data-model').APPEAL_CASE_TYPE} AppealType
 * @typedef {import('@planning-inspectorate/data-model').APPEAL_CASE_PROCEDURE} ProcedureType
 * @typedef {object} AdditionalCheckObject
 * */

/**
 * @param {AppealType} appealType
 * @param {ProcedureType} procedureType
 * @param {string} currentState
 * @param {boolean} [eventElapsed]
 */
const createStateMachine = (appealType, procedureType, currentState, eventElapsed = false) =>
	createMachine({
		id: 'appeals-state-machine',
		initial: currentState || APPEAL_CASE_STATUS.ASSIGN_CASE_OFFICER,
		context: {
			appealType,
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
					validAppealTypes: [APPEAL_TYPE_SHORTHAND_HAS, APPEAL_TYPE_SHORTHAND_FPA],
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
					validAppealTypes: [APPEAL_TYPE_SHORTHAND_HAS, APPEAL_TYPE_SHORTHAND_FPA],
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
					validAppealTypes: [APPEAL_TYPE_SHORTHAND_HAS, APPEAL_TYPE_SHORTHAND_FPA],
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
						target: targetStateOnLpaqComplete[appealType]
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
					validAppealTypes: [APPEAL_TYPE_SHORTHAND_HAS, APPEAL_TYPE_SHORTHAND_FPA],
					validProcedureTypes: [
						APPEAL_CASE_PROCEDURE.WRITTEN,
						APPEAL_CASE_PROCEDURE.HEARING,
						APPEAL_CASE_PROCEDURE.INQUIRY
					]
				}
			},
			[APPEAL_CASE_STATUS.STATEMENTS]: {
				on: {
					[VALIDATION_OUTCOME_COMPLETE]: {
						target: targetStateOnStatementsComplete[procedureType],
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
					validAppealTypes: [APPEAL_TYPE_SHORTHAND_FPA],
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
					validAppealTypes: [APPEAL_TYPE_SHORTHAND_FPA],
					validProcedureTypes: [APPEAL_CASE_PROCEDURE.WRITTEN]
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
					validAppealTypes: [APPEAL_TYPE_SHORTHAND_HAS, APPEAL_TYPE_SHORTHAND_FPA],
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
					validAppealTypes: [APPEAL_TYPE_SHORTHAND_FPA],
					validProcedureTypes: [APPEAL_CASE_PROCEDURE.INQUIRY]
				}
			},
			[APPEAL_CASE_STATUS.AWAITING_EVENT]: {
				on: {
					[VALIDATION_OUTCOME_COMPLETE]: { target: APPEAL_CASE_STATUS.ISSUE_DETERMINATION },
					[VALIDATION_OUTCOME_INCOMPLETE]: { target: APPEAL_CASE_STATUS.EVENT },
					[VALIDATION_OUTCOME_CANCEL]: { target: targetStateOnStatementsComplete[procedureType] },
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
					validAppealTypes: [APPEAL_TYPE_SHORTHAND_HAS, APPEAL_TYPE_SHORTHAND_FPA],
					validProcedureTypes: [
						APPEAL_CASE_PROCEDURE.WRITTEN,
						APPEAL_CASE_PROCEDURE.HEARING,
						APPEAL_CASE_PROCEDURE.INQUIRY
					]
				}
			},
			[APPEAL_CASE_STATUS.ISSUE_DETERMINATION]: {
				on: {
					[APPEAL_CASE_STATUS.COMPLETE]: { target: APPEAL_CASE_STATUS.COMPLETE },
					[APPEAL_CASE_STATUS.CLOSED]: { target: APPEAL_CASE_STATUS.CLOSED },
					[APPEAL_CASE_STATUS.AWAITING_TRANSFER]: {
						target: APPEAL_CASE_STATUS.AWAITING_TRANSFER
					},
					[APPEAL_CASE_STATUS.INVALID]: { target: APPEAL_CASE_STATUS.INVALID },
					[VALIDATION_OUTCOME_INVALID]: { target: APPEAL_CASE_STATUS.INVALID },
					[APPEAL_CASE_STATUS.INVALID]: { target: APPEAL_CASE_STATUS.INVALID },
					[APPEAL_CASE_STATUS.WITHDRAWN]: {
						target: APPEAL_CASE_STATUS.WITHDRAWN
					}
				},
				meta: {
					validAppealTypes: [APPEAL_TYPE_SHORTHAND_HAS, APPEAL_TYPE_SHORTHAND_FPA],
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
					validAppealTypes: [APPEAL_TYPE_SHORTHAND_HAS, APPEAL_TYPE_SHORTHAND_FPA],
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
					validAppealTypes: [APPEAL_TYPE_SHORTHAND_HAS, APPEAL_TYPE_SHORTHAND_FPA],
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
					validAppealTypes: [APPEAL_TYPE_SHORTHAND_HAS, APPEAL_TYPE_SHORTHAND_FPA],
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
					validAppealTypes: [APPEAL_TYPE_SHORTHAND_HAS, APPEAL_TYPE_SHORTHAND_FPA],
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
					validAppealTypes: [APPEAL_TYPE_SHORTHAND_HAS, APPEAL_TYPE_SHORTHAND_FPA],
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
					validAppealTypes: [APPEAL_TYPE_SHORTHAND_HAS, APPEAL_TYPE_SHORTHAND_FPA],
					validProcedureTypes: [
						APPEAL_CASE_PROCEDURE.WRITTEN,
						APPEAL_CASE_PROCEDURE.HEARING,
						APPEAL_CASE_PROCEDURE.INQUIRY
					]
				}
			}
		}
	});

/**
 * @typedef {{ appealType: string, procedureType: string, eventElapsed: boolean }} Ctx
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
	const procedureType = ctx.procedureType;

	if (!appealType || !procedureType || !meta) return false;

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

const targetStateOnStatementsComplete = {
	[APPEAL_CASE_PROCEDURE.HEARING]: APPEAL_CASE_STATUS.EVENT,
	[APPEAL_CASE_PROCEDURE.INQUIRY]: APPEAL_CASE_STATUS.EVIDENCE,
	[APPEAL_CASE_PROCEDURE.WRITTEN]: APPEAL_CASE_STATUS.FINAL_COMMENTS
};

const targetStateOnLpaqComplete = {
	[APPEAL_TYPE_SHORTHAND_FPA]: APPEAL_CASE_STATUS.STATEMENTS,
	[APPEAL_TYPE_SHORTHAND_HAS]: APPEAL_CASE_STATUS.EVENT
};

export default createStateMachine;
