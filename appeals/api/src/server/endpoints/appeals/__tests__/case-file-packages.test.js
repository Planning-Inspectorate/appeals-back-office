// @ts-nocheck
import { BlobServiceClient, generateBlobSASQueryParameters } from '@azure/storage-blob';
import { jest } from '@jest/globals';
import {
	CASE_FILE_PACKAGE_RESPONSE_STATUS,
	CASE_FILE_PACKAGE_STATUS
} from '@pins/appeals/constants/case-file-package.js';

const { default: config } = await import('#config/config.js');
config.featureFlags.featureFlagBackgroundCaseDownload = true;
const { request } = await import('../../../app-test.js');
const { databaseConnector } = await import('#utils/database-connector.js');

const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000';

const packageRecord = {
	id: 'package-id',
	appealId: 1,
	status: CASE_FILE_PACKAGE_STATUS.QUEUED,
	active: true,
	requestedAt: new Date('2026-10-01T12:00:00Z'),
	completedAt: null,
	sizeBytes: null
};

describe('case file package requests', () => {
	beforeEach(() => {
		databaseConnector.appeal.findUnique.mockResolvedValue({ id: 1 });
		databaseConnector.caseFilePackage.create.mockResolvedValue(packageRecord);
		databaseConnector.caseFilePackage.findFirst.mockResolvedValue(packageRecord);
		databaseConnector.caseFilePackage.updateMany.mockResolvedValue({ count: 1 });
		global.mockSendEvents.mockResolvedValue(true);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	test('rejects invalid appeal IDs before reaching the controller', async () => {
		const response = await request.get('/appeals/0/case-file-package').set('azureAdUserId', 'user');
		expect(response.status).toBe(400);
		expect(databaseConnector.caseFilePackage.findFirst).not.toHaveBeenCalled();
	});

	test('queues one new request', async () => {
		const response = await request
			.post('/appeals/1/case-file-package')
			.set('azureAdUserId', 'user');
		expect(response.status).toBe(202);
		expect(databaseConnector.caseFilePackage.create).toHaveBeenCalledWith({
			data: { appealId: 1, requestedBy: 'user' }
		});
		expect(global.mockSendEvents).toHaveBeenCalledWith(
			'appeal-case-file-package',
			[{ appealId: 1, packageId: 'package-id' }],
			expect.anything()
		);
	});

	test('returns existing active request on a duplicate click', async () => {
		databaseConnector.caseFilePackage.create.mockRejectedValue({ code: 'P2002' });
		const response = await request
			.post('/appeals/1/case-file-package')
			.set('azureAdUserId', 'user');
		expect(response.status).toBe(200);
		expect(response.body.status).toBe('queued');
		expect(global.mockSendEvents).not.toHaveBeenCalled();
	});

	test('marks request failed when dispatch fails', async () => {
		global.mockSendEvents.mockResolvedValue(false);
		const response = await request
			.post('/appeals/1/case-file-package')
			.set('azureAdUserId', 'user');
		expect(response.status).toBe(500);
		expect(databaseConnector.caseFilePackage.update).toHaveBeenCalledWith({
			where: { id: 'package-id' },
			data: expect.objectContaining({ status: CASE_FILE_PACKAGE_STATUS.FAILED, active: false })
		});
	});

	test('returns latest package status and size', async () => {
		databaseConnector.caseFilePackage.findFirst.mockResolvedValue({
			...packageRecord,
			status: CASE_FILE_PACKAGE_STATUS.READY,
			sizeBytes: 1048576n
		});
		const response = await request.get('/appeals/1/case-file-package').set('azureAdUserId', 'user');
		expect(response.status).toBe(200);
		expect(response.body).toMatchObject({
			status: CASE_FILE_PACKAGE_STATUS.READY,
			sizeBytes: '1048576'
		});
	});

	test('reports not requested before the first package', async () => {
		databaseConnector.caseFilePackage.findFirst.mockResolvedValue(null);
		const response = await request.get('/appeals/1/case-file-package').set('azureAdUserId', 'user');
		expect(response.status).toBe(200);
		expect(response.body).toEqual({ status: CASE_FILE_PACKAGE_RESPONSE_STATUS.NOT_REQUESTED });
	});

	test('does not issue a download URL before a package is ready', async () => {
		const response = await request
			.get('/appeals/1/case-file-package/download-url')
			.set('azureAdUserId', 'user');
		expect(response.status).toBe(404);
		expect(BlobServiceClient).not.toHaveBeenCalled();
	});

	test('issues a read-only signed blob URL for a ready package', async () => {
		const storageUrl = config.BO_BLOB_STORAGE_ACCOUNT;
		const container = config.BO_BLOB_CONTAINER;
		const packageContainer = config.BO_BLOB_CONTAINER;
		config.BO_BLOB_STORAGE_ACCOUNT = 'https://storage.blob.core.windows.net/';
		config.BO_BLOB_CONTAINER = 'packages';
		databaseConnector.caseFilePackage.findFirst.mockResolvedValue({
			...packageRecord,
			status: CASE_FILE_PACKAGE_STATUS.READY,
			blobPath: 'case-file-packages/package-id.zip'
		});
		BlobServiceClient.mockImplementation(() => ({
			accountName: 'storage',
			getUserDelegationKey: jest.fn().mockResolvedValue({}),
			getContainerClient: () => ({
				getBlobClient: () => ({
					url: 'https://storage.blob.core.windows.net/packages/case-file-packages/package-id.zip'
				})
			})
		}));
		try {
			const response = await request
				.get('/appeals/1/case-file-package/download-url')
				.set('azureAdUserId', 'user');
			expect(response.status).toBe(200);
			expect(response.headers['cache-control']).toBe('no-store');
			expect(response.body.url).toBe(
				'https://storage.blob.core.windows.net/packages/case-file-packages/package-id.zip?signed-token'
			);
			expect(generateBlobSASQueryParameters).toHaveBeenCalledWith(
				expect.objectContaining({
					blobName: 'case-file-packages/package-id.zip',
					containerName: 'packages',
					permissions: 'r',
					protocol: 'https'
				}),
				{},
				'storage'
			);
		} finally {
			config.BO_BLOB_STORAGE_ACCOUNT = storageUrl;
			config.BO_BLOB_CONTAINER = container;
			config.BO_BLOB_CONTAINER = packageContainer;
		}
	});

	test('marks complete only after a valid uploaded ZIP', async () => {
		const path = '/appeals/1/case-file-package/package-id/complete';
		const system = SYSTEM_USER_ID;
		expect((await request.post(path).set('azureAdUserId', system).send({})).status).toBe(400);
		expect(databaseConnector.caseFilePackage.updateMany).not.toHaveBeenCalled();
		const response = await request.post(path).set('azureAdUserId', system).send({
			blobPath: 'case-file-packages/package-id.zip',
			sizeBytes: 100
		});
		expect(response.status).toBe(204);
		expect(databaseConnector.caseFilePackage.updateMany).toHaveBeenCalledWith({
			where: {
				appealId: 1,
				id: 'package-id',
				active: true,
				status: CASE_FILE_PACKAGE_STATUS.PROCESSING
			},
			data: expect.objectContaining({
				status: CASE_FILE_PACKAGE_STATUS.READY,
				active: false,
				sizeBytes: 100
			})
		});
	});

	test('marks failed packages inactive', async () => {
		const path = '/appeals/1/case-file-package/package-id/fail';
		const system = SYSTEM_USER_ID;
		expect(
			(await request.post(path).set('azureAdUserId', system).send({ error: 'Packaging failed' }))
				.status
		).toBe(204);
		expect(databaseConnector.caseFilePackage.updateMany).toHaveBeenCalledWith({
			where: {
				appealId: 1,
				id: 'package-id',
				active: true,
				status: CASE_FILE_PACKAGE_STATUS.PROCESSING
			},
			data: expect.objectContaining({
				status: CASE_FILE_PACKAGE_STATUS.FAILED,
				active: false
			})
		});
	});

	test('worker can check its own package after flag is turned off', async () => {
		const path = '/appeals/1/case-file-package/package-id';
		const response = await request.get(path).set('azureAdUserId', SYSTEM_USER_ID);
		expect(response.status).toBe(200);
		expect(response.body.id).toBe('package-id');
		expect(databaseConnector.caseFilePackage.findFirst).toHaveBeenCalledWith({
			where: { appealId: 1, id: 'package-id' }
		});
	});
});
