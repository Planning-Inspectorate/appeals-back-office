import { camelToScreamingSnake, toCamelCase } from '#utils/string-utils.js';

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

describe('camelToScreamingSnake', () => {
	test('converts camelCase to SCREAMING_SNAKE_CASE', () => {
		expect(camelToScreamingSnake('helloWorld')).toBe('HELLO_WORLD');
		expect(camelToScreamingSnake('accessRequired')).toBe('ACCESS_REQUIRED');
		expect(camelToScreamingSnake('applicantFirstName')).toBe('APPLICANT_FIRST_NAME');
		expect(camelToScreamingSnake('siteAccessDetails')).toBe('SITE_ACCESS_DETAILS');
	});

	test('handles strings with mixed case correctly', () => {
		expect(camelToScreamingSnake('hElLoWoRLd')).toBe('H_EL_LO_WO_R_LD');
		expect(camelToScreamingSnake('AccessRequired')).toBe('ACCESS_REQUIRED');
	});

	test('handles strings with single word correctly', () => {
		expect(camelToScreamingSnake('hello')).toBe('HELLO');
		expect(camelToScreamingSnake('WORLD')).toBe('WORLD');
	});

	test('handles strings with no uppercase letters', () => {
		expect(camelToScreamingSnake('helloworld')).toBe('HELLOWORLD');
		expect(camelToScreamingSnake('accessrequired')).toBe('ACCESSREQUIRED');
	});

	test('removes spaces and then converts to SCREAMING_SNAKE_CASE', () => {
		expect(camelToScreamingSnake('hello world')).toBe('HELLOWORLD');
		expect(camelToScreamingSnake('Multiple   Spaces   Here')).toBe('MULTIPLE_SPACES_HERE');
	});

	test('handles empty strings correctly', () => {
		expect(camelToScreamingSnake('')).toBe('');
	});
});
