// @ts-nocheck
import { databaseConnector } from '#utils/database-connector.js';
import { jest } from '@jest/globals';
import { checkAppealExistsByIdAndAddPartialToRequest } from '../check-appeal-exists-and-add-to-request.js';

describe('partial appeal folder selector', () => {
	let req;
	let res;
	let next;

	beforeEach(() => {
		jest.clearAllMocks();
		req = { params: { appealId: '2' }, query: {} };
		res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
		next = jest.fn();
		databaseConnector.appeal.findUnique.mockResolvedValue({
			id: 2,
			appealType: { key: 'D' }
		});
		databaseConnector.folder.findMany.mockResolvedValue([]);
	});

	it.each([
		{},
		{ folderStage: '' },
		{ folderPaths: '' },
		{ folderStage: ['costs'] },
		{ folderPaths: 'costs/application,' }
	])('returns 400 for missing or invalid query selectors: %j', async (query) => {
		req.query = { include: 'folders', ...query };
		await checkAppealExistsByIdAndAddPartialToRequest()(req, res, next);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.send).toHaveBeenCalledWith({
			errors: {
				folderSelector:
					'Including folders requires a folder selector with a non-empty stage or path selector'
			}
		});
		expect(databaseConnector.appeal.findUnique).not.toHaveBeenCalled();
		expect(next).not.toHaveBeenCalled();
	});

	it('requires selectors for route-configured folder includes too', async () => {
		await checkAppealExistsByIdAndAddPartialToRequest(['folders'])(req, res, next);
		expect(res.status).toHaveBeenCalledWith(400);
		expect(databaseConnector.appeal.findUnique).not.toHaveBeenCalled();
	});

	it('forwards query selectors to the folder query', async () => {
		req.query = {
			include: 'folders',
			folderStage: 'costs',
			folderPaths: 'appeal-decision/caseDecision,appellant-case/appellantCaseWithdrawal'
		};
		await checkAppealExistsByIdAndAddPartialToRequest()(req, res, next);

		expect(databaseConnector.folder.findMany).toHaveBeenCalledWith({
			where: {
				caseId: 2,
				OR: [
					{ path: { startsWith: 'costs' } },
					{
						path: {
							startsWith: 'appeal-decision/caseDecision'
						}
					},
					{
						path: {
							startsWith: 'appellant-case/appellantCaseWithdrawal'
						}
					}
				]
			}
		});
		expect(req.appeal.folders).toEqual([]);
		expect(next).toHaveBeenCalled();
	});

	it('prefers route selectors over query selectors', async () => {
		req.query = { folderStage: 'appellant-case' };
		await checkAppealExistsByIdAndAddPartialToRequest(['folders'], { stage: 'costs' })(
			req,
			res,
			next
		);
		expect(databaseConnector.folder.findMany).toHaveBeenCalledWith({
			where: { caseId: 2, OR: [{ path: { startsWith: 'costs' } }] }
		});
		expect(next).toHaveBeenCalled();
	});

	it('does not require a selector without folders', async () => {
		await checkAppealExistsByIdAndAddPartialToRequest(['appealStatus'])(req, res, next);
		expect(next).toHaveBeenCalled();
		expect(databaseConnector.folder.findMany).not.toHaveBeenCalled();
	});

	it('preserves deprecated include=all without a selector', async () => {
		req.query = { include: 'all' };
		await checkAppealExistsByIdAndAddPartialToRequest()(req, res, next);
		expect(next).toHaveBeenCalled();
		expect(res.status).not.toHaveBeenCalled();
	});

	it.each([undefined, '', 'unknown', 'comment,', 'comment,unknown', { type: 'comment' }])(
		'rejects missing or invalid representation types: %j',
		async (types) => {
			req.query = { include: 'representations', representationTypes: types };
			await checkAppealExistsByIdAndAddPartialToRequest()(req, res, next);
			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.send).toHaveBeenCalledWith({
				errors: {
					representationTypes:
						'Including representations requires a non-empty list of valid representation types'
				}
			});
			expect(databaseConnector.appeal.findUnique).not.toHaveBeenCalled();
			expect(next).not.toHaveBeenCalled();
		}
	);

	it('requires types for route-configured representation includes', async () => {
		await checkAppealExistsByIdAndAddPartialToRequest(['representations'])(req, res, next);
		expect(res.status).toHaveBeenCalledWith(400);
		expect(databaseConnector.appeal.findUnique).not.toHaveBeenCalled();
	});

	it('forwards query representation types to the database', async () => {
		req.query = { include: 'representations', representationTypes: 'comment,lpa_statement' };
		await checkAppealExistsByIdAndAddPartialToRequest()(req, res, next);
		expect(databaseConnector.appeal.findUnique).toHaveBeenCalledWith({
			where: { id: 2 },
			include: {
				appealType: { select: { key: true } },
				representations: { where: { representationType: { in: ['comment', 'lpa_statement'] } } }
			}
		});
		expect(next).toHaveBeenCalled();
	});

	it('supports both selectors and prefers route representation types', async () => {
		req.query = { representationTypes: 'lpa_statement' };
		await checkAppealExistsByIdAndAddPartialToRequest(
			['folders', 'representations'],
			{ stage: 'costs' },
			['comment']
		)(req, res, next);
		expect(databaseConnector.appeal.findUnique).toHaveBeenCalledWith({
			where: { id: 2 },
			include: {
				appealType: { select: { key: true } },
				representations: { where: { representationType: { in: ['comment'] } } }
			}
		});
		expect(databaseConnector.folder.findMany).toHaveBeenCalled();
		expect(next).toHaveBeenCalled();
	});
});
