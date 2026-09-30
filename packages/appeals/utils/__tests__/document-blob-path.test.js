import { mapBlobPath } from '../document-blob-path.js';

describe('mapBlobPath', () => {
	test.each([
		['123', undefined, 'appeal/123/document-guid/v1/document-guid.pdf'],
		['6111111', undefined, 'appeal/6111111/document-guid/v1/document-guid.pdf'],
		['6111111', 3, 'appeal/6111111/document-guid/v3/document-guid.pdf']
	])('maps reference %s and version %s', (reference, version, expectedPath) => {
		expect(mapBlobPath('document-guid', reference, 'document-guid.pdf', version)).toBe(
			expectedPath
		);
	});
});
