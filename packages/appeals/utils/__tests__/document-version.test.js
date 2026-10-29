import { getMaxDocumentVersion } from '../document-version.js';

describe('getMaxDocumentVersion', () => {
	it('returns highest version from latest version and history', () => {
		expect(getMaxDocumentVersion(2, [{ version: 1 }, { version: 4 }])).toBe(4);
	});

	it('defaults to zero when version data is absent', () => {
		expect(getMaxDocumentVersion()).toBe(0);
	});

	it('uses latest version when version history is empty', () => {
		expect(getMaxDocumentVersion(3, [])).toBe(3);
	});
});
