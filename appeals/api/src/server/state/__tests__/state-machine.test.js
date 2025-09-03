import {
	APPEAL_TYPE_SHORTHAND_FPA,
	APPEAL_TYPE_SHORTHAND_HAS,
	VALIDATION_OUTCOME_CANCEL,
	VALIDATION_OUTCOME_COMPLETE,
	VALIDATION_OUTCOME_INCOMPLETE,
	VALIDATION_OUTCOME_INVALID,
	VALIDATION_OUTCOME_VALID
} from '@pins/appeals/constants/support.js';
import { APPEAL_CASE_PROCEDURE, APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import { interpret } from 'xstate';
import createStateMachine from '../create-state-machine';

/**
 * Function to get the next state for HAS appeals based on the initial state and event.
 * @param {string} initial - The initial state of the appeal.
 * @param {string} event - The event that triggers the state transition.
 * @param {boolean} [siteVisitElapsed] - Whether the site visit has elapsed.
 * @return {import('xstate').StateValue} - The next state of the appeal.
 **/
const nextStateHAS = (initial, event, siteVisitElapsed = false) => {
	const machine = createStateMachine(
		APPEAL_TYPE_SHORTHAND_HAS,
		APPEAL_CASE_PROCEDURE.WRITTEN,
		initial,
		siteVisitElapsed
	);
	const service = interpret(machine).start();

	service.send(event);
	return service.state.value;
};

/**
 * Function to get the next state for FPA appeals based on the initial state and event.
 * @param {string} initial - The initial state of the appeal.
 * @param {string} event - The event that triggers the state transition.
 * @param {string} procedureType - The event that triggers the state transition.
 * @param {boolean} [siteVisitElapsed] - Whether the site visit has elapsed.
 * @return {import('xstate').StateValue} - The next state of the appeal.
 **/
const nextStateFPA = (initial, event, procedureType, siteVisitElapsed = false) => {
	const machine = createStateMachine(
		APPEAL_TYPE_SHORTHAND_FPA,
		procedureType,
		initial,
		siteVisitElapsed
	);
	const service = interpret(machine).start();

	service.send(event);
	return service.state.value;
};

describe('State Machine Transitions', () => {
	describe('Assign case office transitions', () => {
		test.each([
			[
				APPEAL_CASE_STATUS.ASSIGN_CASE_OFFICER,
				APPEAL_CASE_STATUS.VALIDATION,
				APPEAL_CASE_STATUS.VALIDATION,
				APPEAL_CASE_STATUS.VALIDATION,
				APPEAL_CASE_STATUS.VALIDATION,
				APPEAL_CASE_STATUS.VALIDATION
			],
			[
				APPEAL_CASE_STATUS.ASSIGN_CASE_OFFICER,
				APPEAL_CASE_STATUS.CLOSED,
				APPEAL_CASE_STATUS.CLOSED,
				APPEAL_CASE_STATUS.CLOSED,
				APPEAL_CASE_STATUS.CLOSED,
				APPEAL_CASE_STATUS.CLOSED
			],
			[
				APPEAL_CASE_STATUS.ASSIGN_CASE_OFFICER,
				APPEAL_CASE_STATUS.AWAITING_TRANSFER,
				APPEAL_CASE_STATUS.AWAITING_TRANSFER,
				APPEAL_CASE_STATUS.AWAITING_TRANSFER,
				APPEAL_CASE_STATUS.AWAITING_TRANSFER,
				APPEAL_CASE_STATUS.AWAITING_TRANSFER
			],
			[
				APPEAL_CASE_STATUS.ASSIGN_CASE_OFFICER,
				APPEAL_CASE_STATUS.WITHDRAWN,
				APPEAL_CASE_STATUS.WITHDRAWN,
				APPEAL_CASE_STATUS.WITHDRAWN,
				APPEAL_CASE_STATUS.WITHDRAWN,
				APPEAL_CASE_STATUS.WITHDRAWN
			],
			[
				APPEAL_CASE_STATUS.ASSIGN_CASE_OFFICER,
				VALIDATION_OUTCOME_INVALID,
				APPEAL_CASE_STATUS.INVALID,
				APPEAL_CASE_STATUS.INVALID,
				APPEAL_CASE_STATUS.INVALID,
				APPEAL_CASE_STATUS.INVALID
			]
		])(
			'correctly transitions from %s state on %s event to %s state',
			(initial, event, expectedHAS, expectedFPAWritten, expectedFPAHearing, expectedFPAInquiry) => {
				expect(nextStateHAS(initial, event)).toBe(expectedHAS);
				expect(nextStateFPA(initial, event, APPEAL_CASE_PROCEDURE.WRITTEN)).toBe(
					expectedFPAWritten
				);
				expect(nextStateFPA(initial, event, APPEAL_CASE_PROCEDURE.HEARING)).toBe(
					expectedFPAHearing
				);
				expect(nextStateFPA(initial, event, APPEAL_CASE_PROCEDURE.INQUIRY)).toBe(
					expectedFPAInquiry
				);
			}
		);
	});

	describe('Validation transitions', () => {
		test.each([
			[
				APPEAL_CASE_STATUS.VALIDATION,
				VALIDATION_OUTCOME_VALID,
				APPEAL_CASE_STATUS.READY_TO_START,
				APPEAL_CASE_STATUS.READY_TO_START,
				APPEAL_CASE_STATUS.READY_TO_START,
				APPEAL_CASE_STATUS.READY_TO_START
			],
			[
				APPEAL_CASE_STATUS.VALIDATION,
				VALIDATION_OUTCOME_INVALID,
				APPEAL_CASE_STATUS.INVALID,
				APPEAL_CASE_STATUS.INVALID,
				APPEAL_CASE_STATUS.INVALID,
				APPEAL_CASE_STATUS.INVALID
			],
			[
				APPEAL_CASE_STATUS.VALIDATION,
				VALIDATION_OUTCOME_INCOMPLETE,
				APPEAL_CASE_STATUS.VALIDATION,
				APPEAL_CASE_STATUS.VALIDATION,
				APPEAL_CASE_STATUS.VALIDATION,
				APPEAL_CASE_STATUS.VALIDATION
			],
			[
				APPEAL_CASE_STATUS.VALIDATION,
				APPEAL_CASE_STATUS.CLOSED,
				APPEAL_CASE_STATUS.CLOSED,
				APPEAL_CASE_STATUS.CLOSED,
				APPEAL_CASE_STATUS.CLOSED,
				APPEAL_CASE_STATUS.CLOSED
			],
			[
				APPEAL_CASE_STATUS.VALIDATION,
				APPEAL_CASE_STATUS.AWAITING_TRANSFER,
				APPEAL_CASE_STATUS.AWAITING_TRANSFER,
				APPEAL_CASE_STATUS.AWAITING_TRANSFER,
				APPEAL_CASE_STATUS.AWAITING_TRANSFER,
				APPEAL_CASE_STATUS.AWAITING_TRANSFER
			],
			[
				APPEAL_CASE_STATUS.VALIDATION,
				APPEAL_CASE_STATUS.WITHDRAWN,
				APPEAL_CASE_STATUS.WITHDRAWN,
				APPEAL_CASE_STATUS.WITHDRAWN,
				APPEAL_CASE_STATUS.WITHDRAWN,
				APPEAL_CASE_STATUS.WITHDRAWN
			]
		])(
			'correctly transitions from %s state on %s event to %s state',
			(initial, event, expectedHAS, expectedFPAWritten, expectedFPAHearing, expectedFPAInquiry) => {
				expect(nextStateHAS(initial, event)).toBe(expectedHAS);
				expect(nextStateFPA(initial, event, APPEAL_CASE_PROCEDURE.WRITTEN)).toBe(
					expectedFPAWritten
				);
				expect(nextStateFPA(initial, event, APPEAL_CASE_PROCEDURE.HEARING)).toBe(
					expectedFPAHearing
				);
				expect(nextStateFPA(initial, event, APPEAL_CASE_PROCEDURE.INQUIRY)).toBe(
					expectedFPAInquiry
				);
			}
		);
	});

	describe('Ready to start transitions', () => {
		test.each([
			[
				APPEAL_CASE_STATUS.READY_TO_START,
				APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
				APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
				APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
				APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
				APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE
			],
			[
				APPEAL_CASE_STATUS.READY_TO_START,
				APPEAL_CASE_STATUS.CLOSED,
				APPEAL_CASE_STATUS.CLOSED,
				APPEAL_CASE_STATUS.CLOSED,
				APPEAL_CASE_STATUS.CLOSED,
				APPEAL_CASE_STATUS.CLOSED
			],
			[
				APPEAL_CASE_STATUS.READY_TO_START,
				APPEAL_CASE_STATUS.AWAITING_TRANSFER,
				APPEAL_CASE_STATUS.AWAITING_TRANSFER,
				APPEAL_CASE_STATUS.AWAITING_TRANSFER,
				APPEAL_CASE_STATUS.AWAITING_TRANSFER,
				APPEAL_CASE_STATUS.AWAITING_TRANSFER
			],
			[
				APPEAL_CASE_STATUS.READY_TO_START,
				APPEAL_CASE_STATUS.WITHDRAWN,
				APPEAL_CASE_STATUS.WITHDRAWN,
				APPEAL_CASE_STATUS.WITHDRAWN,
				APPEAL_CASE_STATUS.WITHDRAWN,
				APPEAL_CASE_STATUS.WITHDRAWN
			]
		])(
			'correctly transitions from %s state on %s event to %s state',
			(initial, event, expectedHAS, expectedFPAWritten, expectedFPAHearing, expectedFPAInquiry) => {
				expect(nextStateHAS(initial, event)).toBe(expectedHAS);
				expect(nextStateFPA(initial, event, APPEAL_CASE_PROCEDURE.WRITTEN)).toBe(
					expectedFPAWritten
				);
				expect(nextStateFPA(initial, event, APPEAL_CASE_PROCEDURE.HEARING)).toBe(
					expectedFPAHearing
				);
				expect(nextStateFPA(initial, event, APPEAL_CASE_PROCEDURE.INQUIRY)).toBe(
					expectedFPAInquiry
				);
			}
		);
	});

	describe('LPA questionnaire transitions', () => {
		test.each([
			[
				APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
				VALIDATION_OUTCOME_COMPLETE,
				APPEAL_CASE_STATUS.EVENT,
				APPEAL_CASE_STATUS.STATEMENTS,
				APPEAL_CASE_STATUS.STATEMENTS,
				APPEAL_CASE_STATUS.STATEMENTS
			],
			[
				APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
				APPEAL_CASE_STATUS.CLOSED,
				APPEAL_CASE_STATUS.CLOSED,
				APPEAL_CASE_STATUS.CLOSED,
				APPEAL_CASE_STATUS.CLOSED,
				APPEAL_CASE_STATUS.CLOSED
			],
			[
				APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
				APPEAL_CASE_STATUS.AWAITING_TRANSFER,
				APPEAL_CASE_STATUS.AWAITING_TRANSFER,
				APPEAL_CASE_STATUS.AWAITING_TRANSFER,
				APPEAL_CASE_STATUS.AWAITING_TRANSFER,
				APPEAL_CASE_STATUS.AWAITING_TRANSFER
			],
			[
				APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
				APPEAL_CASE_STATUS.WITHDRAWN,
				APPEAL_CASE_STATUS.WITHDRAWN,
				APPEAL_CASE_STATUS.WITHDRAWN,
				APPEAL_CASE_STATUS.WITHDRAWN,
				APPEAL_CASE_STATUS.WITHDRAWN
			],
			[
				APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
				VALIDATION_OUTCOME_INVALID,
				APPEAL_CASE_STATUS.INVALID,
				APPEAL_CASE_STATUS.INVALID,
				APPEAL_CASE_STATUS.INVALID,
				APPEAL_CASE_STATUS.INVALID
			]
		])(
			'correctly transitions from %s state on %s event to %s state',
			(initial, event, expectedHAS, expectedFPAWritten, expectedFPAHearing, expectedFPAInquiry) => {
				expect(nextStateHAS(initial, event)).toBe(expectedHAS);
				expect(nextStateFPA(initial, event, APPEAL_CASE_PROCEDURE.WRITTEN)).toBe(
					expectedFPAWritten
				);
				expect(nextStateFPA(initial, event, APPEAL_CASE_PROCEDURE.HEARING)).toBe(
					expectedFPAHearing
				);
				expect(nextStateFPA(initial, event, APPEAL_CASE_PROCEDURE.INQUIRY)).toBe(
					expectedFPAInquiry
				);
			}
		);
	});

	describe('Statements transitions', () => {
		test.each([
			[
				APPEAL_CASE_STATUS.STATEMENTS,
				VALIDATION_OUTCOME_COMPLETE,
				APPEAL_CASE_STATUS.FINAL_COMMENTS,
				APPEAL_CASE_STATUS.EVENT,
				APPEAL_CASE_STATUS.EVIDENCE
			],
			[
				APPEAL_CASE_STATUS.STATEMENTS,
				APPEAL_CASE_STATUS.CLOSED,
				APPEAL_CASE_STATUS.CLOSED,
				APPEAL_CASE_STATUS.CLOSED,
				APPEAL_CASE_STATUS.CLOSED
			],
			[
				APPEAL_CASE_STATUS.STATEMENTS,
				APPEAL_CASE_STATUS.AWAITING_TRANSFER,
				APPEAL_CASE_STATUS.AWAITING_TRANSFER,
				APPEAL_CASE_STATUS.AWAITING_TRANSFER,
				APPEAL_CASE_STATUS.AWAITING_TRANSFER
			],
			[
				APPEAL_CASE_STATUS.STATEMENTS,
				APPEAL_CASE_STATUS.WITHDRAWN,
				APPEAL_CASE_STATUS.WITHDRAWN,
				APPEAL_CASE_STATUS.WITHDRAWN,
				APPEAL_CASE_STATUS.WITHDRAWN
			],
			[
				APPEAL_CASE_STATUS.STATEMENTS,
				VALIDATION_OUTCOME_INVALID,
				APPEAL_CASE_STATUS.INVALID,
				APPEAL_CASE_STATUS.INVALID,
				APPEAL_CASE_STATUS.INVALID
			]
		])(
			'correctly transitions from %s state on %s event to %s state for FPA',
			(initial, event, expectedFPAWritten, expectedFPAHearing, expectedFPAInquiry) => {
				expect(nextStateFPA(initial, event, APPEAL_CASE_PROCEDURE.WRITTEN)).toBe(
					expectedFPAWritten
				);
				expect(nextStateFPA(initial, event, APPEAL_CASE_PROCEDURE.HEARING)).toBe(
					expectedFPAHearing
				);
				expect(nextStateFPA(initial, event, APPEAL_CASE_PROCEDURE.INQUIRY)).toBe(
					expectedFPAInquiry
				);
			}
		);
		test.each([
			[APPEAL_CASE_STATUS.STATEMENTS, VALIDATION_OUTCOME_COMPLETE, APPEAL_CASE_STATUS.STATEMENTS],
			[APPEAL_CASE_STATUS.STATEMENTS, APPEAL_CASE_STATUS.CLOSED, APPEAL_CASE_STATUS.STATEMENTS],
			[
				APPEAL_CASE_STATUS.STATEMENTS,
				APPEAL_CASE_STATUS.AWAITING_TRANSFER,
				APPEAL_CASE_STATUS.STATEMENTS
			],
			[APPEAL_CASE_STATUS.STATEMENTS, APPEAL_CASE_STATUS.WITHDRAWN, APPEAL_CASE_STATUS.STATEMENTS]
		])('correctly remains at %s state for HAS', (initial, event, expectedHAS) => {
			expect(nextStateHAS(initial, event)).toBe(expectedHAS);
		});
	});

	describe('Final comments transitions', () => {
		test.each([
			[APPEAL_CASE_STATUS.FINAL_COMMENTS, VALIDATION_OUTCOME_COMPLETE, APPEAL_CASE_STATUS.EVENT],
			[APPEAL_CASE_STATUS.FINAL_COMMENTS, APPEAL_CASE_STATUS.CLOSED, APPEAL_CASE_STATUS.CLOSED],
			[
				APPEAL_CASE_STATUS.FINAL_COMMENTS,
				APPEAL_CASE_STATUS.AWAITING_TRANSFER,
				APPEAL_CASE_STATUS.AWAITING_TRANSFER
			],
			[
				APPEAL_CASE_STATUS.FINAL_COMMENTS,
				APPEAL_CASE_STATUS.WITHDRAWN,
				APPEAL_CASE_STATUS.WITHDRAWN
			]
		])(
			'correctly transitions from %s state on %s event to %s state for FPA - written',
			(initial, event, expectedFPAWritten) => {
				expect(nextStateFPA(initial, event, APPEAL_CASE_PROCEDURE.WRITTEN)).toBe(
					expectedFPAWritten
				);
			}
		);
		test('should transition to AWAITING_EVENT if site visit has NOT elapsed', () => {
			const initialState = APPEAL_CASE_STATUS.FINAL_COMMENTS;
			const event = VALIDATION_OUTCOME_COMPLETE;
			const procedure = APPEAL_CASE_PROCEDURE.WRITTEN;
			const siteVisitElapsed = false;

			const expectedState = APPEAL_CASE_STATUS.EVENT;

			expect(nextStateFPA(initialState, event, procedure, siteVisitElapsed)).toBe(expectedState);
		});

		test('should transition to ISSUE_DETERMINATION if site visit HAS elapsed', () => {
			const initialState = APPEAL_CASE_STATUS.FINAL_COMMENTS;
			const event = VALIDATION_OUTCOME_COMPLETE;
			const procedure = APPEAL_CASE_PROCEDURE.WRITTEN;
			const siteVisitElapsed = true;

			const expectedState = APPEAL_CASE_STATUS.ISSUE_DETERMINATION;

			expect(nextStateFPA(initialState, event, procedure, siteVisitElapsed)).toBe(expectedState);
		});

		test.each([
			[
				APPEAL_CASE_STATUS.FINAL_COMMENTS,
				VALIDATION_OUTCOME_COMPLETE,
				APPEAL_CASE_STATUS.FINAL_COMMENTS,
				APPEAL_CASE_STATUS.FINAL_COMMENTS,
				APPEAL_CASE_STATUS.FINAL_COMMENTS
			],
			[
				APPEAL_CASE_STATUS.FINAL_COMMENTS,
				APPEAL_CASE_STATUS.CLOSED,
				APPEAL_CASE_STATUS.FINAL_COMMENTS,
				APPEAL_CASE_STATUS.FINAL_COMMENTS,
				APPEAL_CASE_STATUS.FINAL_COMMENTS
			],
			[
				APPEAL_CASE_STATUS.FINAL_COMMENTS,
				APPEAL_CASE_STATUS.AWAITING_TRANSFER,
				APPEAL_CASE_STATUS.FINAL_COMMENTS,
				APPEAL_CASE_STATUS.FINAL_COMMENTS,
				APPEAL_CASE_STATUS.FINAL_COMMENTS
			],
			[
				APPEAL_CASE_STATUS.FINAL_COMMENTS,
				APPEAL_CASE_STATUS.WITHDRAWN,
				APPEAL_CASE_STATUS.FINAL_COMMENTS,
				APPEAL_CASE_STATUS.FINAL_COMMENTS,
				APPEAL_CASE_STATUS.FINAL_COMMENTS
			],
			[
				APPEAL_CASE_STATUS.FINAL_COMMENTS,
				VALIDATION_OUTCOME_INVALID,
				APPEAL_CASE_STATUS.INVALID,
				APPEAL_CASE_STATUS.INVALID,
				APPEAL_CASE_STATUS.INVALID
			]
		])(
			'correctly remains at %s state for HAS and FPA - hearing and inquiry',
			(initial, event, expectedHAS, expectedFPAHearing, expectedFPAInquiry) => {
				expect(nextStateHAS(initial, event)).toBe(expectedHAS);
				expect(nextStateFPA(initial, event, APPEAL_CASE_PROCEDURE.HEARING)).toBe(
					expectedFPAHearing
				);
				expect(nextStateFPA(initial, event, APPEAL_CASE_PROCEDURE.INQUIRY)).toBe(
					expectedFPAInquiry
				);
			}
		);
	});
	describe('Event transitions', () => {
		test.each([
			[
				APPEAL_CASE_STATUS.EVENT,
				VALIDATION_OUTCOME_COMPLETE,
				APPEAL_CASE_STATUS.AWAITING_EVENT,
				APPEAL_CASE_STATUS.AWAITING_EVENT,
				APPEAL_CASE_STATUS.AWAITING_EVENT,
				APPEAL_CASE_STATUS.AWAITING_EVENT
			],
			[
				APPEAL_CASE_STATUS.EVENT,
				VALIDATION_OUTCOME_INCOMPLETE,
				APPEAL_CASE_STATUS.EVENT,
				APPEAL_CASE_STATUS.EVENT,
				APPEAL_CASE_STATUS.EVENT,
				APPEAL_CASE_STATUS.EVENT
			],
			[
				APPEAL_CASE_STATUS.EVENT,
				APPEAL_CASE_STATUS.CLOSED,
				APPEAL_CASE_STATUS.CLOSED,
				APPEAL_CASE_STATUS.CLOSED,
				APPEAL_CASE_STATUS.CLOSED,
				APPEAL_CASE_STATUS.CLOSED
			],
			[
				APPEAL_CASE_STATUS.EVENT,
				APPEAL_CASE_STATUS.WITHDRAWN,
				APPEAL_CASE_STATUS.WITHDRAWN,
				APPEAL_CASE_STATUS.WITHDRAWN,
				APPEAL_CASE_STATUS.WITHDRAWN,
				APPEAL_CASE_STATUS.WITHDRAWN
			],
			[
				APPEAL_CASE_STATUS.EVENT,
				VALIDATION_OUTCOME_INVALID,
				APPEAL_CASE_STATUS.INVALID,
				APPEAL_CASE_STATUS.INVALID,
				APPEAL_CASE_STATUS.INVALID,
				APPEAL_CASE_STATUS.INVALID
			]
		])(
			'correctly transitions from %s state on %s event to %s state',
			(initial, event, expectedHAS, expectedFPAWritten, expectedFPAHearing, expectedFPAInquiry) => {
				expect(nextStateHAS(initial, event)).toBe(expectedHAS);
				expect(nextStateFPA(initial, event, APPEAL_CASE_PROCEDURE.WRITTEN)).toBe(
					expectedFPAWritten
				);
				expect(nextStateFPA(initial, event, APPEAL_CASE_PROCEDURE.HEARING)).toBe(
					expectedFPAHearing
				);
				expect(nextStateFPA(initial, event, APPEAL_CASE_PROCEDURE.INQUIRY)).toBe(
					expectedFPAInquiry
				);
			}
		);
	});

	describe('Evidence transitions', () => {
		test.each([
			[
				APPEAL_CASE_STATUS.EVIDENCE,
				VALIDATION_OUTCOME_COMPLETE,
				APPEAL_CASE_STATUS.EVIDENCE,
				APPEAL_CASE_STATUS.EVIDENCE,
				APPEAL_CASE_STATUS.EVIDENCE,
				APPEAL_CASE_STATUS.EVENT
			],
			[
				APPEAL_CASE_STATUS.EVIDENCE,
				VALIDATION_OUTCOME_INCOMPLETE,
				APPEAL_CASE_STATUS.EVIDENCE,
				APPEAL_CASE_STATUS.EVIDENCE,
				APPEAL_CASE_STATUS.EVIDENCE,
				APPEAL_CASE_STATUS.EVIDENCE
			],
			[
				APPEAL_CASE_STATUS.EVIDENCE,
				APPEAL_CASE_STATUS.CLOSED,
				APPEAL_CASE_STATUS.EVIDENCE,
				APPEAL_CASE_STATUS.EVIDENCE,
				APPEAL_CASE_STATUS.EVIDENCE,
				APPEAL_CASE_STATUS.CLOSED
			],
			[
				APPEAL_CASE_STATUS.EVIDENCE,
				APPEAL_CASE_STATUS.AWAITING_TRANSFER,
				APPEAL_CASE_STATUS.EVIDENCE,
				APPEAL_CASE_STATUS.EVIDENCE,
				APPEAL_CASE_STATUS.EVIDENCE,
				APPEAL_CASE_STATUS.AWAITING_TRANSFER
			],
			[
				APPEAL_CASE_STATUS.EVIDENCE,
				APPEAL_CASE_STATUS.WITHDRAWN,
				APPEAL_CASE_STATUS.EVIDENCE,
				APPEAL_CASE_STATUS.EVIDENCE,
				APPEAL_CASE_STATUS.EVIDENCE,
				APPEAL_CASE_STATUS.WITHDRAWN
			],
			[
				APPEAL_CASE_STATUS.EVIDENCE,
				VALIDATION_OUTCOME_INVALID,
				APPEAL_CASE_STATUS.INVALID,
				APPEAL_CASE_STATUS.INVALID,
				APPEAL_CASE_STATUS.INVALID,
				APPEAL_CASE_STATUS.INVALID
			]
		])(
			'transitions from %s on %s to %s',
			(initial, event, expectedHAS, expectedFPAWritten, expectedFPAHearing, expectedFPAInquiry) => {
				expect(nextStateHAS(initial, event)).toBe(expectedHAS);
				expect(nextStateFPA(initial, event, APPEAL_CASE_PROCEDURE.WRITTEN)).toBe(
					expectedFPAWritten
				);
				expect(nextStateFPA(initial, event, APPEAL_CASE_PROCEDURE.HEARING)).toBe(
					expectedFPAHearing
				);
				expect(nextStateFPA(initial, event, APPEAL_CASE_PROCEDURE.INQUIRY)).toBe(
					expectedFPAInquiry
				);
			}
		);
	});

	describe('Awaiting event transitions', () => {
		test.each([
			[
				APPEAL_CASE_STATUS.AWAITING_EVENT,
				VALIDATION_OUTCOME_COMPLETE,
				APPEAL_CASE_STATUS.ISSUE_DETERMINATION,
				APPEAL_CASE_STATUS.ISSUE_DETERMINATION,
				APPEAL_CASE_STATUS.ISSUE_DETERMINATION,
				APPEAL_CASE_STATUS.ISSUE_DETERMINATION
			],
			[
				APPEAL_CASE_STATUS.AWAITING_EVENT,
				VALIDATION_OUTCOME_INCOMPLETE,
				APPEAL_CASE_STATUS.EVENT,
				APPEAL_CASE_STATUS.EVENT,
				APPEAL_CASE_STATUS.EVENT,
				APPEAL_CASE_STATUS.EVENT
			],
			[
				APPEAL_CASE_STATUS.AWAITING_EVENT,
				VALIDATION_OUTCOME_CANCEL,
				APPEAL_CASE_STATUS.FINAL_COMMENTS,
				APPEAL_CASE_STATUS.FINAL_COMMENTS,
				APPEAL_CASE_STATUS.EVENT,
				APPEAL_CASE_STATUS.EVIDENCE
			],
			[
				APPEAL_CASE_STATUS.AWAITING_EVENT,
				APPEAL_CASE_STATUS.AWAITING_TRANSFER,
				APPEAL_CASE_STATUS.AWAITING_TRANSFER,
				APPEAL_CASE_STATUS.AWAITING_TRANSFER,
				APPEAL_CASE_STATUS.AWAITING_TRANSFER,
				APPEAL_CASE_STATUS.AWAITING_TRANSFER
			],
			[
				APPEAL_CASE_STATUS.AWAITING_EVENT,
				APPEAL_CASE_STATUS.WITHDRAWN,
				APPEAL_CASE_STATUS.WITHDRAWN,
				APPEAL_CASE_STATUS.WITHDRAWN,
				APPEAL_CASE_STATUS.WITHDRAWN,
				APPEAL_CASE_STATUS.WITHDRAWN
			],
			[
				APPEAL_CASE_STATUS.AWAITING_EVENT,
				VALIDATION_OUTCOME_INVALID,
				APPEAL_CASE_STATUS.INVALID,
				APPEAL_CASE_STATUS.INVALID,
				APPEAL_CASE_STATUS.INVALID,
				APPEAL_CASE_STATUS.INVALID
			]
		])(
			'transitions from %s on %s to %s',
			(initial, event, expectedHAS, expectedFPAWritten, expectedFPAHearing, expectedFPAInquiry) => {
				expect(nextStateHAS(initial, event)).toBe(expectedHAS);
				expect(nextStateFPA(initial, event, APPEAL_CASE_PROCEDURE.WRITTEN)).toBe(
					expectedFPAWritten
				);
				expect(nextStateFPA(initial, event, APPEAL_CASE_PROCEDURE.HEARING)).toBe(
					expectedFPAHearing
				);
				expect(nextStateFPA(initial, event, APPEAL_CASE_PROCEDURE.INQUIRY)).toBe(
					expectedFPAInquiry
				);
			}
		);
	});

	describe('Issue determination transitions', () => {
		test.each([
			[
				APPEAL_CASE_STATUS.ISSUE_DETERMINATION,
				APPEAL_CASE_STATUS.COMPLETE,
				APPEAL_CASE_STATUS.COMPLETE,
				APPEAL_CASE_STATUS.COMPLETE,
				APPEAL_CASE_STATUS.COMPLETE,
				APPEAL_CASE_STATUS.COMPLETE
			],
			[
				APPEAL_CASE_STATUS.ISSUE_DETERMINATION,
				APPEAL_CASE_STATUS.CLOSED,
				APPEAL_CASE_STATUS.CLOSED,
				APPEAL_CASE_STATUS.CLOSED,
				APPEAL_CASE_STATUS.CLOSED,
				APPEAL_CASE_STATUS.CLOSED
			],
			[
				APPEAL_CASE_STATUS.ISSUE_DETERMINATION,
				APPEAL_CASE_STATUS.AWAITING_TRANSFER,
				APPEAL_CASE_STATUS.AWAITING_TRANSFER,
				APPEAL_CASE_STATUS.AWAITING_TRANSFER,
				APPEAL_CASE_STATUS.AWAITING_TRANSFER,
				APPEAL_CASE_STATUS.AWAITING_TRANSFER
			],
			[
				APPEAL_CASE_STATUS.ISSUE_DETERMINATION,
				APPEAL_CASE_STATUS.WITHDRAWN,
				APPEAL_CASE_STATUS.WITHDRAWN,
				APPEAL_CASE_STATUS.WITHDRAWN,
				APPEAL_CASE_STATUS.WITHDRAWN,
				APPEAL_CASE_STATUS.WITHDRAWN
			],
			[
				APPEAL_CASE_STATUS.ISSUE_DETERMINATION,
				VALIDATION_OUTCOME_INVALID,
				APPEAL_CASE_STATUS.INVALID,
				APPEAL_CASE_STATUS.INVALID,
				APPEAL_CASE_STATUS.INVALID,
				APPEAL_CASE_STATUS.INVALID
			],
			[
				APPEAL_CASE_STATUS.ISSUE_DETERMINATION,
				APPEAL_CASE_STATUS.INVALID,
				APPEAL_CASE_STATUS.INVALID,
				APPEAL_CASE_STATUS.INVALID,
				APPEAL_CASE_STATUS.INVALID,
				APPEAL_CASE_STATUS.INVALID
			]
		])(
			'transitions from %s on %s to %s',
			(initial, event, expectedHAS, expectedFPAWritten, expectedFPAHearing, expectedFPAInquiry) => {
				expect(nextStateHAS(initial, event)).toBe(expectedHAS);
				expect(nextStateFPA(initial, event, APPEAL_CASE_PROCEDURE.WRITTEN)).toBe(
					expectedFPAWritten
				);
				expect(nextStateFPA(initial, event, APPEAL_CASE_PROCEDURE.HEARING)).toBe(
					expectedFPAHearing
				);
				expect(nextStateFPA(initial, event, APPEAL_CASE_PROCEDURE.INQUIRY)).toBe(
					expectedFPAInquiry
				);
			}
		);
	});

	describe('Awaiting transfer transitions', () => {
		test('transitions from awaiting_transfer on transferred to transferred', () => {
			expect(
				nextStateHAS(APPEAL_CASE_STATUS.AWAITING_TRANSFER, APPEAL_CASE_STATUS.TRANSFERRED)
			).toBe(APPEAL_CASE_STATUS.TRANSFERRED);
			expect(
				nextStateFPA(
					APPEAL_CASE_STATUS.AWAITING_TRANSFER,
					APPEAL_CASE_STATUS.TRANSFERRED,
					APPEAL_CASE_PROCEDURE.WRITTEN
				)
			).toBe(APPEAL_CASE_STATUS.TRANSFERRED);
			expect(
				nextStateFPA(
					APPEAL_CASE_STATUS.AWAITING_TRANSFER,
					APPEAL_CASE_STATUS.TRANSFERRED,
					APPEAL_CASE_PROCEDURE.HEARING
				)
			).toBe(APPEAL_CASE_STATUS.TRANSFERRED);
			expect(
				nextStateFPA(
					APPEAL_CASE_STATUS.AWAITING_TRANSFER,
					APPEAL_CASE_STATUS.TRANSFERRED,
					APPEAL_CASE_PROCEDURE.INQUIRY
				)
			).toBe(APPEAL_CASE_STATUS.TRANSFERRED);
		});
	});
});
