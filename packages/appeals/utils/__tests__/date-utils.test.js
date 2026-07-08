// @ts-nocheck
import { dateIsOnOrAfterDate, nextUKDay } from '../date-utils.js';

describe('nextUKDay', () => {
	it('returns the next day at 00:00 in the UK timezone', () => {
		const date = new Date('2026-01-01T10:00:00Z');
		const result = nextUKDay(date);
		expect(result.toISOString()).toBe('2026-01-02T00:00:00.000Z');
	});

	it('handles BST', () => {
		const date = new Date('2026-06-01T10:00:00Z');
		const result = nextUKDay(date);
		expect(result.toISOString()).toBe('2026-06-01T23:00:00.000Z');
	});

	it('handles end of year', () => {
		const date = new Date('2026-12-31T10:00:00Z');
		const result = nextUKDay(date);
		expect(result.toISOString()).toBe('2027-01-01T00:00:00.000Z');
	});
});

describe('dateIsOnOrAfterDate', () => {
	const cutoff = new Date('2026-04-01T00:00:00.000Z');

	it('returns true when the date is exactly the cutoff', () => {
		expect(dateIsOnOrAfterDate(new Date('2026-04-01T00:00:00.000Z'), cutoff)).toBe(true);
	});

	it('returns true when the date is after the cutoff', () => {
		expect(dateIsOnOrAfterDate(new Date('2026-04-02T10:00:00.000Z'), cutoff)).toBe(true);
	});

	it('returns false when the date is clearly before the cutoff', () => {
		expect(dateIsOnOrAfterDate(new Date('2026-03-30T10:00:00.000Z'), cutoff)).toBe(false);
	});

	it('returns true when the date is April 1st in BST (represented as March 31st 23:00 UTC)', () => {
		expect(dateIsOnOrAfterDate(new Date('2026-03-31T23:00:00.000Z'), cutoff)).toBe(true);
	});

	it('returns true when the date is stored as 2026-04-01T23:00:00.000Z', () => {
		expect(dateIsOnOrAfterDate(new Date('2026-04-01T23:00:00.000Z'), cutoff)).toBe(true);
	});

	it('returns false when the date is stored as 2026-03-31T22:59:59.000Z (before BST cutoff)', () => {
		expect(dateIsOnOrAfterDate(new Date('2026-03-31T22:59:59.000Z'), cutoff)).toBe(false);
	});

	it('returns false when date is invalid', () => {
		expect(dateIsOnOrAfterDate('invalid-date', cutoff)).toBe(false);
	});
});
