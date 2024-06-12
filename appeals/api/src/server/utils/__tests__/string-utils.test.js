import { toCamelCase } from '#utils/string-utils.js';

describe('toCamelCase', () => {
	test('converts a single word to lowercase', () => {
		expect(toCamelCase('Hello')).toBe('hello');
		expect(toCamelCase('WORLD')).toBe('world');
	});

	test('converts multiple words to camelCase', () => {
		expect(toCamelCase('hello world')).toBe('helloWorld');
		expect(toCamelCase('Access Required')).toBe('accessRequired');
		expect(toCamelCase('access required')).toBe('accessRequired');
	});

	test('handles strings with mixed case', () => {
		expect(toCamelCase('hElLo WoRLd')).toBe('helloWorld');
		expect(toCamelCase('Access required')).toBe('accessRequired');
	});

	test('removes spaces and converts to camelCase', () => {
		expect(toCamelCase('access    required  ')).toBe('accessRequired');
		expect(toCamelCase('Multiple   Spaces   Here')).toBe('multipleSpacesHere');
	});

	test('handles empty strings', () => {
		expect(toCamelCase('')).toBe('');
	});
});
