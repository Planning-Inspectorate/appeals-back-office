// @ts-nocheck

import { jest } from '@jest/globals';
const mockArchive = {
	pipe: jest.fn(),
	append: jest.fn(),
	finalize: jest.fn().mockResolvedValue(),
	on: jest.fn(),
	once: jest.fn(),
	destroyed: false,
	destroy: jest.fn()
};

// Mock archiver
jest.unstable_mockModule('archiver', () => ({
	__esModule: true,
	default: jest.fn(() => mockArchive)
}));

const mockGenerateAllPdfs = jest.fn();

const mockConfig = { featureFlags: { featureFlagPdfDownload: false } };
const mockLogger = { warn: jest.fn(), error: jest.fn() };

jest.unstable_mockModule('@pins/appeals.web/environment/config.js', () => ({
	__esModule: true,
	default: mockConfig
}));
jest.unstable_mockModule('#lib/logger.js', () => ({
	__esModule: true,
	default: mockLogger
}));
jest.unstable_mockModule('#app/components/download-all-generated-pdfs.component.js', () => ({
	generateAllPdfs: mockGenerateAllPdfs
}));

// Patch external service functions used by file-downloader.component.js
jest.unstable_mockModule('#appeals/appeal-documents/appeal.documents.service.js', () => ({
	getAllCaseFolders: jest.fn(),
	getFileInfo: jest.fn(),
	getFileVersionsInfo: jest.fn(),
	getRepresentationAttachments: jest.fn()
}));

const mockBlobInstance = {
	getBlobProperties: jest.fn(),
	downloadStream: jest.fn()
};
const BlobStorageClient = jest.fn(() => mockBlobInstance);
BlobStorageClient.fromUrlAndToken = jest.fn(() => mockBlobInstance);
jest.unstable_mockModule('@pins/blob-storage-client', () => ({
	BlobStorageClient
}));
jest.unstable_mockModule('#lib/active-directory-token.js', () => ({
	__esModule: true,
	default: jest.fn()
}));

describe('getBulkDocumentDownload', () => {
	let mockApiClient, mockSession, mockAppeal, mockResponse;
	beforeEach(async () => {
		jest.resetModules();
		mockApiClient = {};
		mockSession = {};
		mockAppeal = { foo: 'bar' };
		mockResponse = {
			req: { setTimeout: jest.fn() },
			setHeader: jest.fn(),
			status: jest.fn().mockReturnThis(),
			send: jest.fn().mockReturnThis(),
			destroy: jest.fn(),
			once: jest.fn()
		};
		mockGenerateAllPdfs.mockReset();
		mockArchive.pipe.mockClear();
		mockArchive.append.mockClear();
		mockArchive.finalize.mockClear();
		mockArchive.destroy.mockClear();
		mockArchive.on.mockClear();
		mockArchive.once.mockClear();
		mockArchive.destroyed = false;
		mockConfig.featureFlags.featureFlagPdfDownload = false;
	});

	it('downloads files and finalizes archive (no pdfs)', async () => {
		const docService = await import('#appeals/appeal-documents/appeal.documents.service.js');
		docService.getAllCaseFolders.mockResolvedValue([
			{
				path: 'folder',
				documents: [
					{
						latestDocumentVersion: {
							blobStorageContainer: 'c',
							blobStoragePath: 'p',
							documentURI: 'uri'
						},
						name: 'f',
						guid: 'g',
						id: 'g'
					}
				]
			}
		]);
		// Patch blob client
		const blobClientMod = await import('@pins/blob-storage-client');
		blobClientMod.BlobStorageClient.mockImplementation(() => ({
			getBlobProperties: jest.fn().mockResolvedValue({}),
			downloadStream: jest.fn().mockResolvedValue({ readableStreamBody: { pipe: jest.fn() } })
		}));

		const { getBulkDocumentDownload } = await import('../file-downloader.component.js');
		await getBulkDocumentDownload(
			{
				apiClient: mockApiClient,
				params: { caseId: '1' },
				session: mockSession,
				currentAppeal: mockAppeal
			},
			mockResponse
		);
		expect(mockResponse.setHeader).toHaveBeenCalledWith('content-type', 'application/zip');
		expect(mockArchive.pipe).toHaveBeenCalledWith(mockResponse);
		expect(mockArchive.finalize).toHaveBeenCalled();
		expect(mockResponse.status).toHaveBeenCalledWith(200);
		expect(mockResponse.send).not.toHaveBeenCalled();
	});

	it('downloads files and appends pdfs if feature flag enabled', async () => {
		mockConfig.featureFlags.featureFlagPdfDownload = true;
		const { getBulkDocumentDownload } = await import('../file-downloader.component.js');
		const docService = await import('#appeals/appeal-documents/appeal.documents.service.js');
		docService.getAllCaseFolders.mockResolvedValue([
			{
				path: 'folder',
				documents: [
					{
						latestDocumentVersion: {
							blobStorageContainer: 'c',
							blobStoragePath: 'p',
							documentURI: 'uri'
						},
						name: 'f',
						guid: 'g',
						id: 'g'
					}
				]
			}
		]);
		const blobClientMod = await import('@pins/blob-storage-client');
		blobClientMod.BlobStorageClient.mockImplementation(() => ({
			getBlobProperties: jest.fn().mockResolvedValue({}),
			downloadStream: jest.fn().mockResolvedValue({ readableStreamBody: { pipe: jest.fn() } })
		}));
		mockGenerateAllPdfs.mockResolvedValue([{ name: 'foo.pdf', buffer: Buffer.from('a') }]);
		await getBulkDocumentDownload(
			{
				apiClient: mockApiClient,
				params: { caseId: '1' },
				session: mockSession,
				currentAppeal: mockAppeal
			},
			mockResponse
		);
		expect(mockGenerateAllPdfs).toHaveBeenCalled();
		expect(mockArchive.append).toHaveBeenCalledWith(expect.any(Buffer), { name: 'foo.pdf' });
		expect(mockArchive.finalize).toHaveBeenCalled();
		expect(mockResponse.status).toHaveBeenCalledWith(200);
		expect(mockResponse.send).not.toHaveBeenCalled();
	});

	it('handles no files found', async () => {
		const { getBulkDocumentDownload } = await import('../file-downloader.component.js');
		const docService = await import('#appeals/appeal-documents/appeal.documents.service.js');
		docService.getAllCaseFolders.mockResolvedValue([]);
		await getBulkDocumentDownload(
			{
				apiClient: mockApiClient,
				params: { caseId: '1' },
				session: mockSession,
				currentAppeal: mockAppeal
			},
			mockResponse
		);
		expect(mockArchive.append).toHaveBeenCalledWith(expect.any(Buffer), {
			name: 'missing-files.json'
		});
		expect(mockArchive.finalize).toHaveBeenCalled();
		expect(mockResponse.status).toHaveBeenCalledWith(200);
		expect(mockResponse.send).not.toHaveBeenCalled();
	});

	it('handles error and destroys archive/response', async () => {
		const { getBulkDocumentDownload } = await import('../file-downloader.component.js');
		const docService = await import('#appeals/appeal-documents/appeal.documents.service.js');
		docService.getAllCaseFolders.mockRejectedValue(new Error('fail'));

		await getBulkDocumentDownload(
			{
				apiClient: mockApiClient,
				params: { caseId: '1' },
				session: mockSession,
				currentAppeal: mockAppeal
			},
			mockResponse
		);
		expect(mockArchive.destroy).toHaveBeenCalled();
		expect(mockResponse.destroy).toHaveBeenCalled();
	});
});
