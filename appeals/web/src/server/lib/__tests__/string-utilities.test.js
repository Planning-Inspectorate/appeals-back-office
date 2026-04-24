import { formatFirstInitialLastName } from '../string-utilities.js';

describe('formatFirstInitialLastName', () => {
	it('formats a standard first and last name', () => {
		expect(formatFirstInitialLastName('John Smith')).toBe('J. Smith');
	});

	it('formats a name with multiple middle names', () => {
		expect(formatFirstInitialLastName('Mary Jane Watson')).toBe('M. Watson');
	});

	it('formats a single name', () => {
		expect(formatFirstInitialLastName('Cher')).toBe('C. Cher');
	});

	it('trims extra spaces and formats correctly', () => {
		expect(formatFirstInitialLastName('  Alice   ')).toBe('A. Alice');
	});

	it('returns empty string for empty input', () => {
		expect(formatFirstInitialLastName('')).toBe('');
	});

	it('handles names with mixed case', () => {
		expect(formatFirstInitialLastName('ALICE Johnson')).toBe('A. Johnson');
	});
});
