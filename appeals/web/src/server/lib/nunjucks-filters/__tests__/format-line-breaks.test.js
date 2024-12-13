import { formatLineBreaks } from '#lib/nunjucks-filters/index.js';

describe('formatLineBreaks', () => {
	it('should format line breaks correctly', () => {
		const text = 'This is a test\r\nThis is another test\r\nThis is a third test';
		const expected = 'This is a test<br>This is another test<br>This is a third test';
		expect(formatLineBreaks(text)).toEqual(expected);
	});
});
