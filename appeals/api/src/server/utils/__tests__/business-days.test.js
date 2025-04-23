import { calculateTimetable } from '#utils/business-days.js';

describe('business-days', () => {
	describe('calculateTimetable', () => {
		const tests = [
			{
				name: 'handle no date',
				appealType: '',
				startedAt: null,
				timetable: undefined
			},
			{
				name: 'not count weekends',
				appealType: 'D',
				startedAt: new Date('2024-09-26T23:00:00Z'), //input is 27/9/2024 (BST)
				timetable: {
					lpaQuestionnaireDueDate: new Date('2024-10-04T22:59:00Z')
				}
			},
			{
				name: 'works across BST -> GMT boundary',
				appealType: 'D',
				startedAt: new Date('2024-10-23T23:00:00Z'), //input is 24/10/2024 (BST)
				timetable: {
					lpaQuestionnaireDueDate: new Date('2024-10-31T23:59:00Z') //GMT
				}
			},
			{
				name: 'works across GMT -> BST boundary',
				appealType: 'D',
				startedAt: new Date('2024-03-28T00:00:00Z'), //input is 28/3/2024 (GMT)
				timetable: {
					// Bank holidays on Good Friday (29/3) and Easter Monday (1/4), 5 days calc correct to the following Tuesday
					lpaQuestionnaireDueDate: new Date('2024-04-08T22:59:00Z') //BST
				}
			},
			{
				name: 'skip bank holidays', // 2024-05-27 was a bank holiday
				appealType: 'D',
				startedAt: new Date('2024-05-22T23:00:00Z'), //input is 23/5/2024 (BST)
				timetable: {
					lpaQuestionnaireDueDate: new Date('2024-05-31T22:59:00Z')
				}
			},
			{
				name: 'work with any start time',
				appealType: 'D',
				startedAt: new Date('2024-09-26T23:00:00Z'), // midnight in Europe/London, input is 27/9
				timetable: {
					lpaQuestionnaireDueDate: new Date('2024-10-04T22:59:00Z')
				}
			},
			{
				name: 'S78W appeal types',
				appealType: 'W',
				procedureType: 'written',
				startedAt: new Date('2024-09-26T23:00:00Z'), // midnight in Europe/London, input is 27/9
				timetable: {
					appellantStatementDueDate: new Date('2024-11-01T23:59:00.000Z'),
					finalCommentsDueDate: new Date('2024-11-15T23:59:00.000Z'),
					ipCommentsDueDate: new Date('2024-11-01T23:59:00.000Z'),
					lpaQuestionnaireDueDate: new Date('2024-10-04T22:59:00Z'),
					lpaStatementDueDate: new Date('2024-11-01T23:59:00.000Z'),
					s106ObligationDueDate: new Date('2024-11-15T23:59:00.000Z')
				}
			},
			{
				name: 'S78H appeal types',
				appealType: 'W',
				procedureType: 'hearing',
				startedAt: new Date('2024-09-26T23:00:00Z'), // midnight in Europe/London, input is 27/9
				timetable: {
					appellantStatementDueDate: new Date('2024-11-01T23:59:00.000Z'),
					finalCommentsDueDate: new Date('2024-11-15T23:59:00.000Z'),
					hearingDate: null,
					ipCommentsDueDate: new Date('2024-11-01T23:59:00.000Z'),
					lpaQuestionnaireDueDate: new Date('2024-10-04T22:59:00Z'),
					lpaStatementDueDate: new Date('2024-11-01T23:59:00.000Z'),
					planningObligationDueDate: null
				}
			}
		];

		for (const t of tests) {
			it('' + t.name, async () => {
				const timetable = await calculateTimetable(t.appealType, t.startedAt, t.procedureType);
				expect(timetable).toEqual(t.timetable);
			});
		}
	});
});
