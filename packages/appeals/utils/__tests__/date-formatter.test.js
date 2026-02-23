// @ts-nocheck
import formatDate, { formatTime, formatTime12h } from '../date-formatter.js';

describe('date-formatter', () => {
	describe('formatDate', () => {
		const tests = [
			{ date: new Date('2024-07-11T10:00Z'), shortened: false, expected: '11 July 2024' },
			{ date: new Date('2024-04-05T23:00Z'), shortened: false, expected: '6 April 2024' },
			{ date: new Date('2024-11-30T15:00Z'), shortened: false, expected: '30 November 2024' },
			{ date: new Date('2024-02-20T15:00Z'), shortened: true, expected: '20 Feb 2024' },
			{ date: new Date('2024-12-24T20:00Z'), shortened: true, expected: '24 Dec 2024' },
			{ date: new Date('2024-09-03T20:00Z'), shortened: true, expected: '3 Sep 2024' },
			{ date: new Date(''), shortened: true, expected: '' }
		];

		it.each(tests)('formats date $date in Europe/London', ({ date, shortened, expected }) => {
			expect(formatDate(date, shortened)).toEqual(expected);
		});

		it('returns empty string when given an ISO date string instead of a Date instance', () => {
			const isoString = '2023-12-25T00:00:00.000Z';
			expect(formatDate(isoString, false)).toEqual('');
		});

		it('returns formatted date when given a Date instance created from the same ISO string', () => {
			const isoString = '2023-12-25T00:00:00.000Z';
			expect(formatDate(new Date(isoString), false)).toEqual('25 December 2023');
		});
	});

	describe('formatTime', () => {
		const tests = [
			{ date: '2024-07-11T10:00:00Z', expected: '11:00' },
			{ date: '2024-04-05T23:15:00Z', expected: '00:15' },
			{ date: '2024-11-30T15:00:00Z', expected: '15:00' },
			{ date: '2024-02-20T15:00:00Z', expected: '15:00' },
			{ date: '2024-12-24T20:00:00Z', expected: '20:00' },
			{ date: '2024-09-03T20:00:00Z', expected: '21:00' },
			{ date: '2024-11-30T23:59:59Z', expected: '23:59' },
			{ date: '2024-12-01T00:00:00Z', expected: '00:00' },
			{ date: '2024-12-01T00:00:01Z', expected: '00:00' }
		];

		it.each(tests)('formats time in 24h clock format', ({ date, expected }) => {
			expect(formatTime(date, 'Europe/London', 'HH:mm')).toEqual(expected);
		});
	});

	describe('formatTime12h', () => {
		const tests = [
			{ date: '2024-07-11T10:00:00Z', expected: '11:00am' },
			{ date: '2024-04-05T23:15:00Z', expected: '12:15am' },
			{ date: '2024-11-30T15:00:00Z', expected: '3:00pm' },
			{ date: '2024-02-20T15:00:00Z', expected: '3:00pm' },
			{ date: '2024-12-24T20:00:00Z', expected: '8:00pm' },
			{ date: '2024-09-03T20:00:00Z', expected: '9:00pm' },
			{ date: '2024-11-30T23:59:59Z', expected: '11:59pm' },
			{ date: '2024-12-01T00:00:00Z', expected: '12:00am' },
			{ date: '2024-12-01T00:00:01Z', expected: '12:00am' },
			{ date: '2024-12-01T11:59:59Z', expected: '11:59am' },
			{ date: '2024-12-01T12:00:00Z', expected: '12:00pm' },
			{ date: '2024-12-01T12:00:01Z', expected: '12:00pm' }
		];

		it.each(tests)('formats time in 24h clock format', ({ date, expected }) => {
			expect(formatTime12h(date, 'Europe/London', 'h:mmaaa').toLowerCase()).toEqual(expected);
		});
	});

	describe('Daylight saving time BST/GMT', () => {
		it('handles clocks go forward correctly', () => {
			expect(formatTime('2024-03-31T01:00Z', 'Europe/London', 'HH:mm')).toEqual('02:00');
			expect(formatTime12h('2024-03-31T01:00Z', 'Europe/London', 'HH:mm')).toEqual('2:00am');
		});

		it('handles clocks go back correctly', () => {
			expect(formatTime('2024-10-27T01:00Z', 'Europe/London', 'HH:mm')).toEqual('01:00');
			expect(formatTime12h('2024-10-27T01:00Z', 'Europe/London', 'HH:mm')).toEqual('1:00am');
		});
	});
});
