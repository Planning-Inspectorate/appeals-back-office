import { createDocumentStorageFilename } from '#utils/document-storage-filename.js';

describe('createDocumentStorageFilename', () => {
	const documentGuid = 'a30ec1dc-3b7b-4d2c-8553-bb8d052593f5';

	test.each([
		['Decision Notice.PDF', `${documentGuid}.pdf`],
		['../../unsafe-name.pdf', `${documentGuid}.pdf`],
		['filename with \\u201cquotes\\u201d.pdf', `${documentGuid}.pdf`],
		['no-extension', documentGuid],
		['archive.tar.gz', `${documentGuid}.gz`],
		['file.PdF ', `${documentGuid}.pdf`],
		['file.pdf.exe', `${documentGuid}.exe`],
		['', documentGuid],
		[null, documentGuid],
		[undefined, documentGuid]
	])('maps %s to a safe storage filename', (originalFilename, expectedFilename) => {
		expect(createDocumentStorageFilename(documentGuid, originalFilename)).toBe(expectedFilename);
	});
});
