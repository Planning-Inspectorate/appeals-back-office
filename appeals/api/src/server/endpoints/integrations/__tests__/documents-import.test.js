import { mapDocumentIn } from '#mappers/integration/commands/document.mapper.js';

describe('document import', () => {
	test('generates distinct safe storage names', () => {
		const documents = [
			'decision notice.pdf',
			'Decision Notice.pdf',
			'filename with \\u201cquotes\\u201d.pdf'
		];
		const documentResults = documents.map((originalFilename) =>
			// @ts-ignore
			mapDocumentIn({
				filename: originalFilename,
				documentId: originalFilename,
				documentType: 'appellantCostsApplication',
				originalFilename
			})
		);

		for (const document of documentResults) {
			//@ts-ignore
			expect(document.fileName).toBe(`${document.documentGuid}.pdf`);
		}
	});
});
