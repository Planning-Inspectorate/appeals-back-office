// @ts-nocheck
import { calculateDueDate } from '#utils/calculate-due-date.js';
import { APPEAL_CASE_PROCEDURE, APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';

describe('calculateDueDate Tests', () => {
	let mockAppeal = {
		appealType: null,
		id: 1,
		address: null,
		appellant: null,
		agent: null,
		lpa: null,
		reference: 'APP/Q9999/D/21/33813',
		caseExtensionDate: null,
		caseCreatedDate: new Date('2023-01-01T00:00:00.000Z'),
		appealStatus: [
			{
				id: 2648,
				status: APPEAL_CASE_STATUS.READY_TO_START,
				createdAt: new Date('2024-01-09T16:14:31.387Z'),
				valid: true,
				appealId: 496,
				subStateMachineName: null,
				compoundStateName: null
			}
		],
		appealTimetable: null
	};

	beforeEach(() => {
		mockAppeal = {
			appellant: null,
			agent: null,
			address: null,
			appealType: null,
			id: 1,
			lpa: null,
			reference: 'APP/Q9999/D/21/33813',
			caseExtensionDate: null,
			caseCreatedDate: new Date('2023-01-01T00:00:00.000Z'),
			appealStatus: [
				{
					id: 2648,
					status: APPEAL_CASE_STATUS.READY_TO_START,
					createdAt: new Date('2024-01-09T16:14:31.387Z'),
					valid: true,
					appealId: 496,
					subStateMachineName: null,
					compoundStateName: null
				}
			],
			appealTimetable: null
		};
	});

	test('maps STATE_TARGET_READY_TO_START status', async () => {
		mockAppeal.appealStatus[0].status = APPEAL_CASE_STATUS.READY_TO_START;
		mockAppeal.caseExtensionDate = new Date('2023-02-01');
		mockAppeal.appellantCase = { appellantCaseValidationOutcome: { name: 'Incomplete' } };
		// @ts-ignore
		const dueDate = await calculateDueDate(mockAppeal);
		expect(dueDate).toEqual(new Date('2023-02-01'));
	});

	test('maps STATE_TARGET_READY_TO_START status with Incomplete status', async () => {
		mockAppeal.appealStatus[0].status = APPEAL_CASE_STATUS.READY_TO_START;
		const createdAtPlusFiveDate = new Date('2023-01-06T00:00:00.000Z');
		// @ts-ignore
		const dueDate = await calculateDueDate(mockAppeal, '');
		expect(dueDate).toEqual(createdAtPlusFiveDate);
	});

	test('maps STATE_TARGET_LPA_QUESTIONNAIRE_DUE', async () => {
		mockAppeal.appealStatus[0].status = APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE;

		const createdAtPlusTenDate = new Date('2023-01-11T00:00:00.000Z');
		// @ts-ignore
		const dueDate = await calculateDueDate(mockAppeal, '');
		expect(dueDate).toEqual(createdAtPlusTenDate);
	});

	test('maps STATE_TARGET_LPA_QUESTIONNAIRE_DUE status with appealTimetable lpaQuestionnaireDueDate', async () => {
		let mockAppealWithTimetable = {
			...mockAppeal,
			appealTimetable: {
				id: 1262,
				appealId: 523,
				lpaQuestionnaireDueDate: new Date('2023-03-01T00:00:00.000Z'),
				issueDeterminationDate: null,
				lpaStatementDueDate: null
			}
		};
		mockAppealWithTimetable.appealStatus[0].status = APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE;

		// @ts-ignore
		const dueDate = await calculateDueDate(mockAppealWithTimetable, '');
		expect(dueDate).toEqual(new Date('2023-03-01T00:00:00.000Z'));
	});

	test('maps STATE_TARGET_ASSIGN_CASE_OFFICER', async () => {
		mockAppeal.appealStatus[0].status = APPEAL_CASE_STATUS.ASSIGN_CASE_OFFICER;

		const createdAtPlusFifteenDate = new Date('2023-01-16T00:00:00.000Z');
		// @ts-ignore
		const dueDate = await calculateDueDate(mockAppeal, '');
		expect(dueDate).toEqual(createdAtPlusFifteenDate);
	});

	test('maps STATE_TARGET_ISSUE_DETERMINATION when site visit available', async () => {
		mockAppeal.appealStatus[0].status = APPEAL_CASE_STATUS.ISSUE_DETERMINATION;
		mockAppeal.siteVisit = { visitDate: new Date('2023-02-01T00:00:00.000Z') };
		const createdAtPlusFortyBusinessDays = new Date('2023-03-29T00:00:00.000Z');
		// @ts-ignore
		const dueDate = await calculateDueDate(mockAppeal, '');
		expect(dueDate).toEqual(createdAtPlusFortyBusinessDays);
	});

	test('maps STATE_TARGET_ISSUE_DETERMINATION when site visit not available', async () => {
		mockAppeal.appealStatus[0].status = APPEAL_CASE_STATUS.ISSUE_DETERMINATION;

		const createdAtPlusThirtyBusinessDays = new Date('2025-07-04T00:00:00.000Z');
		mockAppeal.caseCreatedDate = new Date('2025-05-22T00:00:00.000Z');

		// @ts-ignore
		const dueDate = await calculateDueDate(mockAppeal, '');
		expect(dueDate).toEqual(createdAtPlusThirtyBusinessDays);
	});

	test('maps STATE_TARGET_ISSUE_DETERMINATION status with appealTimetable issueDeterminationDate', async () => {
		let mockAppealWithTimetable = {
			...mockAppeal,
			appealTimetable: {
				id: 1262,
				appealId: 523,
				lpaQuestionnaireDueDate: null,
				issueDeterminationDate: new Date('2023-03-01T00:00:00.000Z'),
				lpaStatementDueDate: null
			}
		};
		mockAppealWithTimetable.appealStatus[0].status = APPEAL_CASE_STATUS.ISSUE_DETERMINATION;
		mockAppealWithTimetable.caseCreatedDate = new Date('2025-05-22T00:00:00.000Z');
		// @ts-ignore
		const dueDate = await calculateDueDate(mockAppealWithTimetable, '');
		// dueDate.setDate(dueDate.getDate());
		expect(dueDate).toEqual(new Date('2025-07-04T00:00:00.000Z'));
	});

	test('maps STATE_TARGET_STATEMENT_REVIEW', async () => {
		mockAppeal.appealStatus[0].status = APPEAL_CASE_STATUS.STATEMENTS;

		const createdAtPlusFiftyFiveDate = new Date('2023-02-25T00:00:00.000Z');
		// @ts-ignore
		const dueDate = await calculateDueDate(mockAppeal, '');
		expect(dueDate).toEqual(createdAtPlusFiftyFiveDate);
	});

	test('maps STATE_TARGET_STATEMENT_REVIEW status with appealTimetable lpaStatementDueDate', async () => {
		let mockAppealWithTimetable = {
			...mockAppeal,
			appealTimetable: {
				id: 1262,
				appealId: 523,
				lpaQuestionnaireDueDate: null,
				issueDeterminationDate: null,
				lpaStatementDueDate: new Date('2023-03-01T00:00:00.000Z'),
				resubmitAppealTypeDate: null
			}
		};
		mockAppealWithTimetable.appealStatus[0].status = APPEAL_CASE_STATUS.STATEMENTS;

		// @ts-ignore
		const dueDate = await calculateDueDate(mockAppealWithTimetable, '');
		expect(dueDate).toEqual(new Date('2023-03-01T00:00:00.000Z'));
	});

	test('maps STATE_TARGET_FINAL_COMMENT_REVIEW', async () => {
		mockAppeal.appealStatus[0].status = APPEAL_CASE_STATUS.FINAL_COMMENTS;

		const createdAtPlusSixtyDate = new Date('2023-03-02T00:00:00.000Z');
		// @ts-ignore
		const dueDate = await calculateDueDate(mockAppeal, '');
		expect(dueDate).toEqual(createdAtPlusSixtyDate);
	});

	test('handles STATE_TARGET_AWAITING_SITE_VISIT', async () => {
		mockAppeal.appealStatus[0].status = APPEAL_CASE_STATUS.AWAITING_EVENT;
		mockAppeal.siteVisit = { visitDate: new Date('2023-02-01T00:00:00.000Z') };
		mockAppeal.procedureType = {
			key: APPEAL_CASE_PROCEDURE.WRITTEN
		};

		// @ts-ignore
		const dueDate = await calculateDueDate(mockAppeal, '');
		expect(dueDate).toEqual(mockAppeal.siteVisit.visitDate);
	});

	test('handles STATE_TARGET_AWAITING_HEARING', async () => {
		mockAppeal.appealStatus[0].status = APPEAL_CASE_STATUS.AWAITING_EVENT;
		mockAppeal.hearing = { hearingStartTime: new Date('2023-02-01T00:00:00.000Z') };
		mockAppeal.procedureType = {
			key: APPEAL_CASE_PROCEDURE.HEARING
		};

		// @ts-ignore
		const dueDate = await calculateDueDate(mockAppeal, '');
		expect(dueDate).toEqual(mockAppeal.hearing.hearingStartTime);
	});

	describe('handles STATE_TARGET_SITE_VISIT', () => {
		let mockAppealWithTimetable = {};

		beforeEach(() => {
			mockAppealWithTimetable = {
				...mockAppeal,
				appealTimetable: {
					id: 1262,
					appealId: 523,
					lpaQuestionnaireDueDate: new Date('2023-03-01T00:00:00.000Z')
				}
			};
			mockAppealWithTimetable.appealStatus[0].status = APPEAL_CASE_STATUS.EVENT;
		});

		test('when final comments due date does not exist', async () => {
			// @ts-ignore
			const dueDate = await calculateDueDate(mockAppealWithTimetable, '');
			expect(dueDate).toEqual(mockAppealWithTimetable.appealTimetable.lpaQuestionnaireDueDate);
		});

		test('when final comments due date does exist', async () => {
			// @ts-ignore
			mockAppealWithTimetable.appealTimetable.finalCommentsDueDate = new Date(
				'2023-03-22T00:00:00.000Z'
			);
			const dueDate = await calculateDueDate(mockAppealWithTimetable, '');
			expect(dueDate).toEqual(mockAppealWithTimetable.appealTimetable.finalCommentsDueDate);
		});
	});

	test('handles STATE_TARGET_COMPLETE', async () => {
		mockAppeal.appealStatus[0].status = APPEAL_CASE_STATUS.COMPLETE;
		mockAppeal.appellantCase = { numberOfResidencesNetChange: 5 };

		// @ts-ignore
		const dueDate = await calculateDueDate(mockAppeal, '', {});
		expect(dueDate).toBeNull();
	});

	test('handles unexpected status (default case)', async () => {
		mockAppeal.appealStatus[0].status = 'unexpected_status';

		// @ts-ignore
		const dueDate = await calculateDueDate(mockAppeal, '');
		expect(dueDate).toBeUndefined();
	});
});
