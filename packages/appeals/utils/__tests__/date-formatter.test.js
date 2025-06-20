// @ts-nocheck
import formatDate, { formatTime, formatTime12h } from '../date-formatter.js';
import { zonedTimeToUtc } from 'date-fns-tz';

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
	});

	describe('formatTime', () => {
		const tests = [
			{ date: '2024-07-11T10:00Z', expected: '10:00' },
			{ date: '2024-04-05T23:15Z', expected: '23:15' },
			{ date: '2024-11-30T15:00Z', expected: '15:00' },
			{ date: '2024-02-20T15:00Z', expected: '15:00' },
			{ date: '2024-12-24T20:00Z', expected: '20:00' },
			{ date: '2024-09-03T20:00Z', expected: '20:00' }
		];

		it.each(tests)('formats time in 24h clock format', ({ date, expected }) => {
			expect(formatTime(zonedTimeToUtc(date, 'Europe/London'))).toEqual(expected);
		});
	});

	describe('formatTime12h', () => {
		const tests = [
			{ date: '2024-07-11T10:00Z', expected: '10:00am' },
			{ date: '2024-04-05T23:15Z', expected: '11:15pm' },
			{ date: '2024-11-30T15:00Z', expected: '3:00pm' },
			{ date: '2024-02-20T15:00Z', expected: '3:00pm' },
			{ date: '2024-12-24T20:00Z', expected: '8:00pm' },
			{ date: '2024-09-03T20:00Z', expected: '8:00pm' }
		];

		it.each(tests)('formats time in 24h clock format', ({ date, expected }) => {
			expect(formatTime12h(zonedTimeToUtc(date, 'Europe/London'))).toEqual(expected);
		});
	});
});
