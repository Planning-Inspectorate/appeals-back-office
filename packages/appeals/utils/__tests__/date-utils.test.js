// @ts-nocheck
import { nextUKDay } from '../date-utils.js';

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
