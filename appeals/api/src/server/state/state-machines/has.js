import { createMachine } from 'xstate';
import {
	APPEAL_TYPE_SHORTHAND_HAS,
	STATUSES,
	STATE_TYPE_FINAL,
	VALIDATION_OUTCOME_COMPLETE,
	VALIDATION_OUTCOME_INCOMPLETE,
	VALIDATION_OUTCOME_INVALID,
	VALIDATION_OUTCOME_VALID
} from '../../endpoints/constants.js';

/**
 * @param {string} currentState
 */
const stateMachine = (currentState) =>
	createMachine({
		id: APPEAL_TYPE_SHORTHAND_HAS,
		initial: currentState || STATUSES.STATE_TARGET_ASSIGN_CASE_OFFICER,
		states: {
			[STATUSES.STATE_TARGET_ASSIGN_CASE_OFFICER]: {
				on: {
					[STATUSES.STATE_TARGET_VALIDATION]: { target: STATUSES.STATE_TARGET_VALIDATION },
					[STATUSES.STATE_TARGET_CLOSED]: { target: STATUSES.STATE_TARGET_CLOSED },
					[STATUSES.STATE_TARGET_AWAITING_TRANSFER]: {
						target: STATUSES.STATE_TARGET_AWAITING_TRANSFER
					}
				}
			},
			[STATUSES.STATE_TARGET_VALIDATION]: {
				on: {
					[VALIDATION_OUTCOME_VALID]: { target: STATUSES.STATE_TARGET_READY_TO_START },
					[VALIDATION_OUTCOME_INVALID]: { target: STATUSES.STATE_TARGET_INVALID },
					[VALIDATION_OUTCOME_INCOMPLETE]: undefined,
					[STATUSES.STATE_TARGET_CLOSED]: { target: STATUSES.STATE_TARGET_CLOSED },
					[STATUSES.STATE_TARGET_AWAITING_TRANSFER]: {
						target: STATUSES.STATE_TARGET_AWAITING_TRANSFER
					}
				}
			},
			[STATUSES.STATE_TARGET_READY_TO_START]: {
				on: {
					[STATUSES.STATE_TARGET_LPA_QUESTIONNAIRE_DUE]: {
						target: STATUSES.STATE_TARGET_LPA_QUESTIONNAIRE_DUE
					},
					[STATUSES.STATE_TARGET_CLOSED]: { target: STATUSES.STATE_TARGET_CLOSED },
					[STATUSES.STATE_TARGET_AWAITING_TRANSFER]: {
						target: STATUSES.STATE_TARGET_AWAITING_TRANSFER
					}
				}
			},
			[STATUSES.STATE_TARGET_LPA_QUESTIONNAIRE_DUE]: {
				on: {
					[VALIDATION_OUTCOME_COMPLETE]: { target: STATUSES.STATE_TARGET_ISSUE_DETERMINATION },
					[VALIDATION_OUTCOME_INCOMPLETE]: undefined,
					[STATUSES.STATE_TARGET_CLOSED]: { target: STATUSES.STATE_TARGET_CLOSED },
					[STATUSES.STATE_TARGET_AWAITING_TRANSFER]: {
						target: STATUSES.STATE_TARGET_AWAITING_TRANSFER
					}
				}
			},
			[STATUSES.STATE_TARGET_ISSUE_DETERMINATION]: {
				on: {
					[STATUSES.STATE_TARGET_COMPLETE]: { target: STATUSES.STATE_TARGET_COMPLETE },
					[STATUSES.STATE_TARGET_CLOSED]: { target: STATUSES.STATE_TARGET_CLOSED },
					[STATUSES.STATE_TARGET_AWAITING_TRANSFER]: {
						target: STATUSES.STATE_TARGET_AWAITING_TRANSFER
					},
					[STATUSES.STATE_TARGET_INVALID]: { target: STATUSES.STATE_TARGET_INVALID }
				}
			},
			[STATUSES.STATE_TARGET_AWAITING_TRANSFER]: {
				on: {
					[STATUSES.STATE_TARGET_TRANSFERRED]: { target: STATUSES.STATE_TARGET_TRANSFERRED }
				}
			},
			[STATUSES.STATE_TARGET_INVALID]: {
				type: STATE_TYPE_FINAL
			},
			[STATUSES.STATE_TARGET_TRANSFERRED]: {
				type: STATE_TYPE_FINAL
			},
			[STATUSES.STATE_TARGET_CLOSED]: {
				type: STATE_TYPE_FINAL
			},
			[STATUSES.STATE_TARGET_WITHDRAWN]: {
				type: STATE_TYPE_FINAL
			},
			[STATUSES.STATE_TARGET_COMPLETE]: {
				type: STATE_TYPE_FINAL
			}
		}
	});

export default stateMachine;
