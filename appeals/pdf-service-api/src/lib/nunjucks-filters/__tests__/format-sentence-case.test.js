// @ts-nocheck
import { formatSentenceCase } from '../format-sentence-case.js';

describe('format-sentence-case', () => {
	it('should format undefined as the default string', () => {
		const result = formatSentenceCase();
		expect(result).toEqual('Not answered');
	});

	it('should format an empty string as a custom default string', () => {
		const result = formatSentenceCase('', 'None');
		expect(result).toEqual('None');
	});

	it('should format a string correctly', () => {
		const result = formatSentenceCase('simple-sentence_here and _there');
		expect(result).toEqual('Simple sentence here and there');
	});
});
