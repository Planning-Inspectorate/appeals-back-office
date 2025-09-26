// @ts-nocheck
import {
	appealData,
	finalCommentsForReviewWithAttachments
} from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/documents';

describe('file-downloader', () => {
	const appealId = 17284;
	const appealReference = '6017284';

	beforeAll(teardown);

	beforeEach(() => {
		installMockApi();
		nock('http://test/')
			.get(`/appeals/${appealId}`)
			.reply(200, { ...appealData, appealId });

		nock('http://test/')
			.get(`/appeals/${appealId}/document-folders`)
			.reply(200, [
				{
					folderId: 1234,
					path: 'representation/attachments',
					documents: [
						{
							guid: 'guid',
							latestDocumentVersion: {
								blobStorageContainer: 'blob-container',
								blobStoragePath: 'blob-storage-path',
								documentURI: 'document-uri'
							},
							name: 'file-name.pdf'
						}
					]
				}
			]);

		nock('http://test/')
			.get(`/appeals/${appealId}/reps`)
			.reply(200, finalCommentsForReviewWithAttachments)
			.persist();
	});

	afterEach(teardown);

	it('should download zip file', async () => {
		const downloadUrl = `${baseUrl}/${appealId}/bulk-download/case-${appealReference}.zip`;
		const response = await request.get(downloadUrl);
		expect(response.statusCode).toBe(200);
	});
});
