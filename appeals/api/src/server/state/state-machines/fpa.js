import { createMachine } from 'xstate';
import {
	APPEAL_TYPE_SHORTHAND_FPA,
	STATE_TARGET_COMPLETE,
	STATE_TARGET_FINAL_COMMENT_REVIEW,
	STATE_TARGET_INVALID,
	STATE_TARGET_ISSUE_DETERMINATION,
	STATE_TARGET_LPA_QUESTIONNAIRE_DUE,
	STATE_TARGET_READY_TO_START,
	STATE_TARGET_STATEMENT_REVIEW,
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
		id: APPEAL_TYPE_SHORTHAND_FPA,
		initial: currentState || STATE_TARGET_READY_TO_START,
		states: {
			[STATE_TARGET_READY_TO_START]: {
				on: {
					[VALIDATION_OUTCOME_VALID]: { target: STATE_TARGET_LPA_QUESTIONNAIRE_DUE },
					[VALIDATION_OUTCOME_INVALID]: { target: STATE_TARGET_INVALID }
				}
			},
			[STATE_TARGET_LPA_QUESTIONNAIRE_DUE]: {
				on: {
					[VALIDATION_OUTCOME_COMPLETE]: { target: STATE_TARGET_STATEMENT_REVIEW },
					[VALIDATION_OUTCOME_INCOMPLETE]: undefined
				}
			},
			[STATE_TARGET_STATEMENT_REVIEW]: {
				on: {
					[STATE_TARGET_FINAL_COMMENT_REVIEW]: { target: STATE_TARGET_FINAL_COMMENT_REVIEW }
				}
			},
			[STATE_TARGET_FINAL_COMMENT_REVIEW]: {
				on: {
					[STATE_TARGET_ISSUE_DETERMINATION]: { target: STATE_TARGET_ISSUE_DETERMINATION }
				}
			},
			[STATE_TARGET_ISSUE_DETERMINATION]: {
				on: {
					[STATE_TARGET_COMPLETE]: { target: STATE_TARGET_COMPLETE }
				}
			},
			[STATE_TARGET_COMPLETE]: {
				type: STATE_TYPE_FINAL
			},
			[STATE_TARGET_INVALID]: {
				type: STATE_TYPE_FINAL
			}
		}
	});

export default stateMachine;
