import { FOLDERS } from '../../constants/documents.js';
import { isValidFolderSelector } from '../folder-selector.js';

describe('isValidFolderSelector', () => {
	it.each([
		{ stage: 'appellant-case' },
		{ paths: [FOLDERS[0]] },
		{ paths: [FOLDERS[0], FOLDERS[1]] },
		{ stage: 'appellant-case', paths: [FOLDERS[0].slice(0, 10)] }
	])('returns true for a valid selector: %j', (selector) => {
		expect(isValidFolderSelector(selector)).toBe(true);
	});

	it.each([
		undefined,
		null,
		'stage',
		{},
		{ stage: '' },
		{ stage: '  ' },
		{ stage: 'not-a-folder-stage' },
		{ stage: ' costs ' },
		{ paths: [] },
		{ paths: [''] },
		{ paths: ['  '] },
		{ paths: [1] },
		{ stage: 'appellant-case', paths: [] },
		{ stage: 'appellant-case', paths: ['  '] }
	])('returns false for an invalid selector: %j', (selector) => {
		expect(isValidFolderSelector(selector)).toBe(false);
	});
});
