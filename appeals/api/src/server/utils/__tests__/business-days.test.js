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
				startedAt: new Date('2024-09-27T22:59:00Z'),
				timetable: {
					lpaQuestionnaireDueDate: new Date('2024-10-04T22:59:00Z')
				}
			},
			{
				name: 'works across BST -> GMT boundary',
				appealType: 'D',
				startedAt: new Date('2024-10-24T22:59:00Z'), //input is 25/10/2024
				timetable: {
					lpaQuestionnaireDueDate: new Date('2024-10-31T23:59:00Z')
				}
			},
			{
				name: 'works across GMT -> BST boundary',
				appealType: 'D',
				startedAt: new Date('2025-03-28T23:59:00Z'), //
				timetable: {
					lpaQuestionnaireDueDate: new Date('2025-04-04T22:59:00Z')
				}
			},
			{
				name: 'skip bank holidays', // 2024-05-27 was a bank holiday
				appealType: 'D',
				startedAt: new Date('2024-05-23T22:59:00Z'),
				timetable: {
					lpaQuestionnaireDueDate: new Date('2024-05-31T22:59:00Z')
				}
			},
			{
				name: 'work with any start time',
				appealType: 'D',
				startedAt: new Date('2024-09-26T23:00:00Z'), // midnight in Europe/London, input is 27/9
				timetable: {
					lpaQuestionnaireDueDate: new Date('2024-10-03T23:00:00Z') // midnight in Europe/London 5 working days later
				}
			}
		];

		for (const t of tests) {
			it('' + t.name, async () => {
				const timetable = await calculateTimetable(t.appealType, t.startedAt);
				expect(timetable).toEqual(t.timetable);
			});
		}
	});
});
