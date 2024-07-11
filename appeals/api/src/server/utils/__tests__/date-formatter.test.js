import formatDate from '../date-formatter.js';

describe('date-formatter', () => {
	describe('formatDate', () => {
		const tests = [
			{ date: new Date('2024-07-11T10:00Z'), shortened: false, expected: '11 July 2024' },
			{ date: new Date('2024-04-05T23:00Z'), shortened: false, expected: '6 April 2024' },
			{ date: new Date('2024-11-30T15:00Z'), shortened: false, expected: '30 November 2024' },
			{ date: new Date('2024-02-20T15:00Z'), shortened: true, expected: '20 Feb 2024' },
			{ date: new Date('2024-12-24T20:00Z'), shortened: true, expected: '24 Dec 2024' },
			{ date: new Date('2024-09-03T20:00Z'), shortened: true, expected: '3 Sep 2024' }
		];

		it.each(tests)('formats date $date in Europe/London', ({ date, shortened, expected }) => {
			expect(formatDate(date, shortened)).toEqual(expected);
		});
	});
});
