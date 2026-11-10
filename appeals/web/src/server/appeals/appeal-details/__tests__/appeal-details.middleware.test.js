// @ts-nocheck
import { jest } from '@jest/globals';
import { validateAppealWithInclude } from '../appeal-details.middleware.js';
import { getAppealDetailsFromId } from '../appeal-details.service.js';

describe('partial appeal folder selector', () => {
	let apiClient;
	let appeal;

	beforeEach(() => {
		appeal = { appealId: 2, folders: [] };
		apiClient = { get: jest.fn().mockReturnValue({ json: jest.fn().mockResolvedValue(appeal) }) };
	});

	it.each([undefined, {}, { stage: '' }, { paths: [] }, { paths: [''] }])(
		'rejects explicit folders without a valid selector: %j',
		(selector) => {
			expect(() => validateAppealWithInclude(['folders'], selector)).toThrow(
				'Including folders requires a folder selector'
			);
			expect(() => getAppealDetailsFromId(apiClient, '2', 'folders', selector)).toThrow(
				'Including folders requires a folder selector'
			);
			expect(apiClient.get).not.toHaveBeenCalled();
		}
	);

	it('forwards stage and path prefixes from middleware to API', async () => {
		const req = { params: { appealId: '2' }, apiClient };
		const res = { status: jest.fn().mockReturnThis(), render: jest.fn() };
		const next = jest.fn();
		await validateAppealWithInclude(['folders', 'appealType'], {
			stage: 'costs',
			paths: ['appeal-decision/caseDecision', 'appellant-case/appellantCaseWithdrawal']
		})(req, res, next);

		const url = new URL(apiClient.get.mock.calls[0][0], 'http://api/');
		expect(url.pathname).toBe('/appeals/2');
		expect(url.searchParams.get('include')).toBe('folders,appealType');
		expect(url.searchParams.get('folderStage')).toBe('costs');
		expect(url.searchParams.get('folderPaths')).toBe(
			'appeal-decision/caseDecision,appellant-case/appellantCaseWithdrawal'
		);
		expect(req.currentAppeal).toBe(appeal);
		expect(next).toHaveBeenCalled();
	});

	it.each([
		[{ stage: 'costs' }, 'folderStage', 'costs'],
		[{ paths: ['costs/appellantCosts'] }, 'folderPaths', 'costs/appellantCosts']
	])('supports either selector independently: %j', async (selector, key, value) => {
		await getAppealDetailsFromId(apiClient, '2', 'folders', selector);
		const url = new URL(apiClient.get.mock.calls[0][0], 'http://api/');
		expect(url.searchParams.get(key)).toBe(value);
	});

	it('preserves calls without folder includes', async () => {
		await getAppealDetailsFromId(apiClient, '2', 'appealType');
		expect(apiClient.get).toHaveBeenCalledWith('appeals/2?include=appealType');
	});

	it.each([undefined, [], [''], ['unknown'], ['comment', 'unknown'], 'comment'])(
		'rejects representations without valid types: %j',
		(types) => {
			expect(() => validateAppealWithInclude(['representations'], undefined, types)).toThrow(
				'Including representations requires a non-empty list of valid representation types'
			);
			expect(() =>
				getAppealDetailsFromId(apiClient, '2', 'representations', undefined, types)
			).toThrow(
				'Including representations requires a non-empty list of valid representation types'
			);
			expect(apiClient.get).not.toHaveBeenCalled();
		}
	);

	it('forwards representation types alongside folder selectors to the API', async () => {
		const req = { params: { appealId: '2' }, apiClient };
		const res = { status: jest.fn().mockReturnThis(), render: jest.fn() };
		const next = jest.fn();
		await validateAppealWithInclude(['folders', 'representations'], { stage: 'costs' }, [
			'comment',
			'lpa_statement'
		])(req, res, next);

		const url = new URL(apiClient.get.mock.calls[0][0], 'http://api/');
		expect(url.searchParams.get('include')).toBe('folders,representations');
		expect(url.searchParams.get('folderStage')).toBe('costs');
		expect(url.searchParams.get('representationTypes')).toBe('comment,lpa_statement');
		expect(req.currentAppeal).toBe(appeal);
		expect(next).toHaveBeenCalled();
	});

	it('supports representation filtering without folders', async () => {
		await getAppealDetailsFromId(apiClient, '2', 'representations', undefined, ['comment']);
		expect(apiClient.get).toHaveBeenCalledWith(
			'appeals/2?include=representations&representationTypes=comment'
		);
	});
});
