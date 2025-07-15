// @ts-nocheck

import { formatDate } from '../format-date.js';

describe('format-date', () => {
	it('should format undefined as an empty string', () => {
		const result = formatDate();
		expect(result).toEqual('');
	});

	it('should format a specified date to the default format', () => {
		const result = formatDate('2025-11-21 10:15');
		expect(result).toEqual('21 November 2025');
	});

	it('should format a specified date to a custom format', () => {
		const result = formatDate('2025-11-21 10:15', 'dd MMM yyyy HH:mm');
		expect(result).toEqual('21 Nov 2025 10:15');
	});
});
