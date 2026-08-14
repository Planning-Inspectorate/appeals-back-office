// @ts-nocheck

import { jest } from '@jest/globals';
let archiveEntryCallback;
const mockArchive = {
	pipe: jest.fn(),
	append: jest.fn(() => {
		archiveEntryCallback?.();
		archiveEntryCallback = undefined;
	}),
	finalize: jest.fn().mockResolvedValue(),
	on: jest.fn(),
	once: jest.fn((event, callback) => {
		if (event === 'entry') {
			archiveEntryCallback = callback;
		}
		return mockArchive;
	}),
	removeListener: jest.fn(),
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
const mockLogger = { warn: jest.fn(), error: jest.fn(), info: jest.fn(), debug: jest.fn() };

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
	getRepresentationAttachments: jest.fn(),
	getAllRepresentationAttachments: jest.fn().mockResolvedValue([])
}));

const mockBlobInstance = {
	getBlobProperties: jest.fn(),
	downloadStream: jest.fn()
};
const BlobStorageClient = jest.fn(() => mockBlobInstance);
BlobStorageClient.fromUrlAndToken = jest.fn(() => mockBlobInstance);
BlobStorageClient.fromUrlAndCredential = jest.fn(() => mockBlobInstance);
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
		archiveEntryCallback = undefined;
		mockConfig.featureFlags.featureFlagPdfDownload = false;
		mockBlobInstance.getBlobProperties.mockReset();
		mockBlobInstance.downloadStream.mockReset();
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
		mockBlobInstance.getBlobProperties.mockResolvedValue({});
		mockBlobInstance.downloadStream.mockResolvedValue({ readableStreamBody: { pipe: jest.fn() } });

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
		mockBlobInstance.getBlobProperties.mockResolvedValue({});
		mockBlobInstance.downloadStream.mockResolvedValue({ readableStreamBody: { pipe: jest.fn() } });
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

	it('skips a failed blob download and still finalizes the zip', async () => {
		const docService = await import('#appeals/appeal-documents/appeal.documents.service.js');
		docService.getAllCaseFolders.mockResolvedValue([
			{
				path: 'folder',
				documents: [
					{
						latestDocumentVersion: {
							blobStorageContainer: 'c',
							blobStoragePath: 'bad',
							documentURI: 'uri'
						},
						name: 'bad.pdf',
						guid: 'bad',
						id: 'bad'
					},
					{
						latestDocumentVersion: {
							blobStorageContainer: 'c',
							blobStoragePath: 'good',
							documentURI: 'uri'
						},
						name: 'good.pdf',
						guid: 'good',
						id: 'good'
					}
				]
			}
		]);

		mockBlobInstance.getBlobProperties.mockResolvedValue({});
		mockBlobInstance.downloadStream.mockImplementation((container, blobPath) => {
			if (blobPath === 'bad') {
				return Promise.reject(new Error('blob failed'));
			}

			return Promise.resolve({ readableStreamBody: { pipe: jest.fn() } });
		});

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

		expect(mockArchive.append).toHaveBeenCalledWith(
			expect.any(Object),
			expect.objectContaining({ name: 'Folder/good.pdf' })
		);
		expect(mockArchive.append).toHaveBeenCalledWith(expect.any(Buffer), {
			name: 'missing-files.json'
		});
		expect(mockArchive.finalize).toHaveBeenCalled();
		expect(mockResponse.status).toHaveBeenCalledWith(200);
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

	it('maps published representation attachments correctly', async () => {
		const { getRepresentationAttachmentFullNames } =
			await import('../file-downloader.component.js');
		const docService = await import('#appeals/appeal-documents/appeal.documents.service.js');
		docService.getAllRepresentationAttachments.mockResolvedValue([
			{
				representationType: 'comment',
				status: 'published',
				attachments: [
					{
						documentGuid: 'guid-1',
						documentVersion: {
							document: { guid: 'guid-1', name: 'attachment1.pdf' }
						}
					}
				]
			}
		]);

		const result = await getRepresentationAttachmentFullNames(mockApiClient, '11175');
		expect(docService.getAllRepresentationAttachments).toHaveBeenCalledWith(mockApiClient, '11175');
		expect(result['guid-1']).toBe(
			'Representations/Interested party comments/Accepted/Comment 1/attachment1.pdf'
		);
	});

	it('handles hundreds of IP comments with attachments', async () => {
		const { getRepresentationAttachmentFullNames, getBulkFileInfo } =
			await import('../file-downloader.component.js');
		const docService = await import('#appeals/appeal-documents/appeal.documents.service.js');

		// Generate 350 mock representations with attachments on #5, #35, #250, #350
		const mockReps = Array.from({ length: 350 }, (_, idx) => {
			const repNum = idx + 1;
			const hasAttachment = [5, 35, 250, 350].includes(repNum);
			return {
				id: repNum,
				representationType: 'comment',
				status: repNum % 2 === 0 ? 'published' : 'valid',
				attachments: hasAttachment
					? [
							{
								documentGuid: `guid-${repNum}`,
								documentVersion: {
									document: { guid: `guid-${repNum}`, name: `doc-${repNum}.pdf` }
								}
							}
						]
					: []
			};
		});

		docService.getAllRepresentationAttachments.mockResolvedValue(mockReps);

		mockApiClient.get = jest.fn().mockReturnValue({
			json: jest.fn().mockResolvedValue([
				{
					path: 'representation/representationAttachments',
					documents: [5, 35, 250, 350].map((num) => ({
						id: `guid-${num}`,
						name: `doc-${num}.pdf`,
						latestDocumentVersion: {
							blobStorageContainer: 'container',
							blobStoragePath: `path/doc-${num}.pdf`,
							documentURI: `http://blob/doc-${num}.pdf`
						}
					}))
				}
			])
		});

		const attachmentNames = await getRepresentationAttachmentFullNames(mockApiClient, '11175');
		expect(docService.getAllRepresentationAttachments).toHaveBeenCalledWith(mockApiClient, '11175');
		expect(attachmentNames['guid-35']).toBe(
			'Representations/Interested party comments/Accepted/Comment 35/doc-35.pdf'
		);
		expect(attachmentNames['guid-350']).toBe(
			'Representations/Interested party comments/Accepted/Comment 350/doc-350.pdf'
		);

		const bulkFileInfo = await getBulkFileInfo(mockApiClient, '11175', 'ip-comments');
		expect(bulkFileInfo).toHaveLength(4);
		expect(bulkFileInfo.find((f) => f.fullName.includes('Comment 35'))?.fullName).toBe(
			'Representations/Interested party comments/Accepted/Comment 35/doc-35.pdf'
		);
		expect(bulkFileInfo.find((f) => f.fullName.includes('Comment 350'))?.fullName).toBe(
			'Representations/Interested party comments/Accepted/Comment 350/doc-350.pdf'
		);
	});
});
