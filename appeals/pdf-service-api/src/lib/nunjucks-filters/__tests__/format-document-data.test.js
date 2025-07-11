// @ts-nocheck

import { formatDocumentData } from '../format-document-data.js';

describe('format-document-data', () => {
	it('should format undefined as "No documents"', () => {
		const result = formatDocumentData();
		expect(result).toEqual('No documents');
	});

	it('should format empty document as "No documents"', () => {
		const result = formatDocumentData({ documents: [] });
		expect(result).toEqual('No documents');
	});

	it('should format a list of documents with only one document as a string', () => {
		const result = formatDocumentData({ documents: [{ name: 'test.pdf' }] });
		expect(result).toEqual('test.pdf');
	});

	it('should format a list of documents with more than one document as a bulleted list', () => {
		const result = formatDocumentData({
			documents: [{ name: 'test1.pdf' }, { name: 'test2.pdf' }]
		});
		expect(result).toEqual(
			'<ul class="govuk-list govuk-list--bullet"><li>test1.pdf</li><li>test2.pdf</li></ul>'
		);
	});
});
