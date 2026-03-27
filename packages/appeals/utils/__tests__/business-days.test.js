// @ts-nocheck
import { APPEAL_CASE_TYPE } from '@planning-inspectorate/data-model';
import nock from 'nock';
import { calculateTimetable, getFullAppealBaseTimetableKey } from '../business-days.js';

describe('business-days', () => {
	beforeEach(() => {
		nock.cleanAll();
		nock('https://www.gov.uk')
			.get('/bank-holidays.json')
			.reply(200, {
				'england-and-wales': {
					division: 'england-and-wales',
					events: [
						{ title: 'Good Friday', date: '2024-03-29', notes: '', bunting: true },
						{ title: 'Easter Monday', date: '2024-04-01', notes: '', bunting: true },
						{ title: 'Early May bank holiday', date: '2024-05-06', notes: '', bunting: true },
						{ title: 'Spring bank holiday', date: '2024-05-27', notes: '', bunting: true }
					]
				}
			})
			.persist();
	});

	afterEach(() => {
		nock.cleanAll();
	});
	describe('calculateTimetable', () => {
		const tests = [
			{
				name: 'handle no date',
				appealType: '',
				startedAt: null,
				timetable: undefined
			},

			{
				name: 'works across BST -> GMT boundary',
				appealType: APPEAL_CASE_TYPE.D,
				startedAt: new Date('2024-10-23T23:00:00Z'), //input is 24/10/2024 (BST)
				timetable: {
					lpaQuestionnaireDueDate: new Date('2024-10-31T23:59:00Z') //GMT
				}
			},
			{
				name: 'works across GMT -> BST boundary',
				appealType: APPEAL_CASE_TYPE.D,
				startedAt: new Date('2024-03-28T00:00:00Z'), //input is 28/3/2024 (GMT)
				timetable: {
					// Bank holidays on Good Friday (29/3) and Easter Monday (1/4), 5 days calc correct to the following Tuesday
					lpaQuestionnaireDueDate: new Date('2024-04-08T22:59:00Z') //BST
				}
			},
			{
				name: 'skip bank holidays', // 2024-05-27 was a bank holiday
				appealType: APPEAL_CASE_TYPE.D,
				startedAt: new Date('2024-05-22T23:00:00Z'), //input is 23/5/2024 (BST)
				timetable: {
					lpaQuestionnaireDueDate: new Date('2024-05-31T22:59:00Z')
				}
			},
			{
				name: 'work with any start time',
				appealType: APPEAL_CASE_TYPE.D,
				startedAt: new Date('2024-09-26T23:00:00Z'), // midnight in Europe/London, input is 27/9
				timetable: {
					lpaQuestionnaireDueDate: new Date('2024-10-04T22:59:00Z')
				}
			},
			{
				name: 'calculates days before inquiry date correctly',
				appealType: APPEAL_CASE_TYPE.W,
				startedAt: new Date('2024-03-28T00:00:00Z'),
				procedureType: 'inquiry',
				inquiryDate: new Date('2024-05-15T00:00:00Z'),
				timetable: {
					lpaQuestionnaireDueDate: new Date('2024-04-08T22:59:00Z'),
					ipCommentsDueDate: new Date('2024-05-07T22:59:00Z'),
					lpaStatementDueDate: new Date('2024-05-07T22:59:00Z'),
					proofOfEvidenceAndWitnessesDueDate: new Date('2024-04-16T22:59:00Z')
				}
			}
		];

		// Only run the test if it's a week day as in the weekend it will fail'
		if (new Date().getDay() >= 1 && new Date().getDay() <= 5) {
			tests.push({
				name: 'not count weekends',
				appealType: APPEAL_CASE_TYPE.D,
				startedAt: new Date('2024-09-26T23:00:00Z'), //input is 27/9/2024 (BST)
				timetable: {
					lpaQuestionnaireDueDate: new Date('2024-10-04T22:59:00Z')
				}
			});
		}

		for (const t of tests) {
			it('' + t.name, async () => {
				const timetable = await calculateTimetable(
					t.appealType,
					t.startedAt,
					t.procedureType,
					t.inquiryDate
				);
				// @ts-ignore
				expect(timetable).toEqual(t.timetable);
			});
		}
	});

	describe('getFullAppealBaseTimetableKey', () => {
		const tests = [
			{ appealType: APPEAL_CASE_TYPE.H, expected: APPEAL_CASE_TYPE.H },
			{ appealType: APPEAL_CASE_TYPE.X, expected: APPEAL_CASE_TYPE.H },
			{ appealType: APPEAL_CASE_TYPE.C, expected: APPEAL_CASE_TYPE.C },
			{ appealType: APPEAL_CASE_TYPE.W, expected: APPEAL_CASE_TYPE.W },
			{ appealType: 'unknown-type', expected: APPEAL_CASE_TYPE.W }
		];

		for (const t of tests) {
			it(`returns correct base timetable key for appeal type ${t.appealType}`, () => {
				const result = getFullAppealBaseTimetableKey(t.appealType);
				expect(result).toBe(t.expected);
			}, 20000); // Increased timeout to allow for slow CI machines
		}
	});
});
describe('business-days backward calculations', () => {
	beforeEach(() => {
		nock.cleanAll();
		nock('https://www.gov.uk')
			.get('/bank-holidays.json')
			.reply(200, {
				'england-and-wales': {
					division: 'england-and-wales',
					events: [{ title: 'Summer Bank Holiday', date: '2025-08-25', notes: '', bunting: true }]
				}
			})
			.persist();
	});

	afterEach(() => {
		nock.cleanAll();
	});

	describe('calculateTimetable with inquiryDate (backward calc)', () => {
		it('should account for bank holidays by moving the deadline earlier', async () => {
			const inquiryDate = new Date('2025-08-27T10:00:00Z');
			const startedAt = new Date('2025-01-01T10:00:00Z');

			const timetable = await calculateTimetable(
				APPEAL_CASE_TYPE.W,
				startedAt,
				'inquiry',
				inquiryDate
			);

			expect(timetable.proofOfEvidenceAndWitnessesDueDate).toEqual(
				new Date('2025-07-30T22:59:00Z')
			);
		});

		it('should move the deadline even further if the calculated day itself is a bank holiday', async () => {
			const inquiryDate = new Date('2025-09-22T10:00:00Z');
			const startedAt = new Date('2025-01-01T10:00:00Z');

			const timetable = await calculateTimetable(
				APPEAL_CASE_TYPE.W,
				startedAt,
				'inquiry',
				inquiryDate
			);
			expect(timetable.proofOfEvidenceAndWitnessesDueDate).toEqual(
				new Date('2025-08-25T22:59:00Z')
			);
		});
	});
});
