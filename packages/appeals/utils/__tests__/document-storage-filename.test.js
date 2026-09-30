import { createDocumentStorageFilename } from '../document-storage-filename.js';

describe('createDocumentStorageFilename', () => {
	const documentGuid = 'a30ec1dc-3b7b-4d2c-8553-bb8d052593f5';

	test.each([
		['Decision Notice.PDF', `${documentGuid}.pdf`],
		['../../unsafe-name.pdf', `${documentGuid}.pdf`],
		['filename with \\u201cquotes\\u201d.pdf', `${documentGuid}.pdf`],
		['no-extension', documentGuid],
		['report', documentGuid],
		['.pdf', documentGuid],
		['.pdf ', documentGuid],
		['report.pdf ', `${documentGuid}.pdf`],
		['report.pdf. ', `${documentGuid}.pdf`],
		['report.PDF', `${documentGuid}.pdf`],
		['report.p?df', documentGuid],
		['archive.tar.gz', `${documentGuid}.gz`],
		['file.PdF ', `${documentGuid}.pdf`],
		['file.pdf.exe', `${documentGuid}.exe`],
		['', documentGuid],
		[null, documentGuid],
		[undefined, documentGuid]
	])('maps %s to a safe storage filename', (originalFilename, expectedFilename) => {
		expect(createDocumentStorageFilename(documentGuid, originalFilename)).toBe(expectedFilename);
	});

	test('handles long runs of spaces before an extension', () => {
		const filename = `report${' '.repeat(100_000)}.PDF`;

		expect(createDocumentStorageFilename(documentGuid, filename)).toBe(`${documentGuid}.pdf`);
	});

	test('removes long runs of trailing dots and spaces', () => {
		const filename = `report.pdf${'. '.repeat(100_000)}`;

		expect(createDocumentStorageFilename(documentGuid, filename)).toBe(`${documentGuid}.pdf`);
	});

	test('handles filenames containing only dots and spaces', () => {
		expect(createDocumentStorageFilename(documentGuid, '. '.repeat(100_000))).toBe(documentGuid);
	});
});
