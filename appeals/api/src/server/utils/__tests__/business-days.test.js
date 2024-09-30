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
				name: 'work across across BST -> GMT boundary',
				appealType: 'D',
				startedAt: new Date('2024-10-30T22:59:00Z'),
				timetable: {
					lpaQuestionnaireDueDate: new Date('2024-11-06T23:59:00Z')
				}
			},
			{
				name: 'work across across GMT -> BST boundary',
				appealType: 'D',
				startedAt: new Date('2025-03-28T23:59:00Z'),
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
				startedAt: new Date('2024-09-26T23:00:00Z'), // midnight in Europe/London
				timetable: {
					lpaQuestionnaireDueDate: new Date('2024-10-04T22:59:00Z') // 23:59 in Europe/London
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
