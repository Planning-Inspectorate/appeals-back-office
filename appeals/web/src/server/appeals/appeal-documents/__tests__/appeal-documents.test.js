import nock from 'nock';
import supertest from 'supertest';
import { parseHtml } from '@pins/platform';
import { createTestEnvironment } from '#testing/index.js';
import {
	appellantCaseDataNotValidated,
	documentFileVersionsInfo
} from '#testing/app/fixtures/referencedata.js';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const validAppealId = 1;
const invalidAppealId = 2;
const validFolderId = 1;
const invalidFolderId = 2;
const documentId = '0e4ce48f-2d67-4659-9082-e80a15182386';
const validFolders = [
	{ folderId: validFolderId, path: 'appellantCase/newSupportingDocuments', caseId: validAppealId }
];

const getControllerEndpoint = (
	/** @type {number} */ appealId,
	/** @type {number} */ folderId,
	/** @type {string|undefined} */ documentId
) => {
	let baseUrl = `/appeals-service/appeal-details/${appealId}/appellant-case/add-documents/${folderId}`;
	if (documentId) {
		baseUrl += `/${documentId}`;
	}
	return baseUrl;
};

describe('documents upload', () => {
	beforeEach(() => {
		installMockApi();
		nock('http://test/')
			.get('/appeals/1/appellant-cases/0')
			.reply(200, appellantCaseDataNotValidated);
	});
	afterEach(teardown);

	it('should return 404 if appeal ID is not found', async () => {
		nock('http://test/').get(`/appeals/${invalidAppealId}`).reply(404);
		nock('http://test/').get(`/appeals/${invalidAppealId}/document-folders/1`).reply(404);

		const response = await request.get(getControllerEndpoint(invalidAppealId, invalidFolderId));

		expect(response.statusCode).toBe(404);
	});

	it('should return 404 if folder ID is not found', async () => {
		nock('http://test/').get(`/appeals/${validAppealId}`).reply(200, { id: validAppealId });
		nock('http://test/')
			.get(`/appeals/${validAppealId}/document-folders/1`)
			.reply(200, validFolders);

		const response = await request.get(getControllerEndpoint(validAppealId, invalidFolderId));
		expect(response.status).toBe(404);
	});

	it('should return 404 if document ID is not found', async () => {
		nock('http://test/').get(`/appeals/${validAppealId}`).reply(200, { id: validAppealId });
		nock('http://test/')
			.get(`/appeals/${validAppealId}/document-folders/1`)
			.reply(200, validFolders[0]);
		nock('http://test/').get(`/appeals/${invalidAppealId}/documents/${documentId}`).reply(404);

		const response = await request.get(
			getControllerEndpoint(validAppealId, validFolderId, documentId)
		);
		expect(response.status).toBe(404);
	});

	it('should render upload form if appeal ID and folder ID are found', async () => {
		nock('http://test/').get(`/appeals/${validAppealId}`).reply(200, { id: validAppealId });
		nock('http://test/')
			.get(`/appeals/${validAppealId}/document-folders/1`)
			.reply(200, validFolders[0]);

		const response = await request.get(getControllerEndpoint(validAppealId, validFolderId));
		expect(response.status).toBe(200);

		const html = parseHtml(response.text);
		expect(html.innerHTML).toMatchSnapshot();

		const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

		expect(unprettifiedElement.innerHTML).toContain('Upload documents</h1>');
		expect(unprettifiedElement.innerHTML).toContain('<form method="POST"');
		expect(unprettifiedElement.innerHTML).toContain('Choose file</button>');
		expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
	});

	it('should render upload form if appeal ID, folder ID and document ID are found', async () => {
		nock('http://test/').get(`/appeals/${validAppealId}`).reply(200, { id: validAppealId });
		nock('http://test/')
			.get(`/appeals/${validAppealId}/document-folders/1`)
			.reply(200, validFolders[0]);
		nock('http://test/')
			.get(`/appeals/${validAppealId}/documents/${documentId}`)
			.reply(200, {
				caseId: validAppealId,
				id: documentId,
				name: 'Doc A',
				latestDocumentVersion: {
					fileName: 'A',
					documentType: 'docs',
					version: 1
				}
			});
		nock('http://test/')
			.get(`/appeals/${validAppealId}/documents/${documentId}/versions`)
			.reply(200, documentFileVersionsInfo);

		const response = await request.get(
			getControllerEndpoint(validAppealId, validFolderId, documentId)
		);
		expect(response.status).toBe(200);

		const html = parseHtml(response.text);
		expect(html.innerHTML).toMatchSnapshot();

		const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

		expect(unprettifiedElement.innerHTML).toContain('Upload an updated document</h1>');
		expect(unprettifiedElement.innerHTML).toContain('<form method="POST"');
		expect(unprettifiedElement.innerHTML).toContain('Choose file</button>');
		expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
	});

	it('should render appeal ID and folder ID as data attributes', async () => {
		nock('http://test/').get(`/appeals/${validAppealId}`).reply(200, { id: validAppealId });
		nock('http://test/')
			.get(`/appeals/${validAppealId}/document-folders/1`)
			.reply(200, validFolders[0]);

		const response = await request.get(getControllerEndpoint(validAppealId, validFolderId));
		const html = parseHtml(response.text);

		const dataAttributes = processAttrs(html.querySelector('.pins-file-upload')?.attributes);
		// @ts-ignore
		expect(dataAttributes['data-case-id']).toEqual(validAppealId.toString());
		// @ts-ignore
		expect(dataAttributes['data-folder-id']).toEqual(validFolderId.toString());
		// @ts-ignore
		expect(dataAttributes['data-document-id']).toBeUndefined();
	});

	it('should render all necessary metadata attributes', async () => {
		nock('http://test/').get(`/appeals/${validAppealId}`).reply(200, { id: validAppealId });
		nock('http://test/')
			.get(`/appeals/${validAppealId}/document-folders/1`)
			.reply(200, validFolders[0]);
		nock('http://test/')
			.get(`/appeals/${validAppealId}/documents/${documentId}`)
			.reply(200, { latestDocumentVersion: {} });
		nock('http://test/')
			.get(`/appeals/${validAppealId}/documents/${documentId}/versions`)
			.reply(200, documentFileVersionsInfo);

		const response = await request.get(
			getControllerEndpoint(validAppealId, validFolderId, documentId)
		);
		const html = parseHtml(response.text);

		const dataAttributes = processAttrs(html.querySelector('.pins-file-upload')?.attributes);
		// @ts-ignore
		expect(dataAttributes['data-case-id']).toEqual(validAppealId.toString());
		// @ts-ignore
		expect(dataAttributes['data-folder-id']).toEqual(validFolderId.toString());
		// @ts-ignore
		expect(dataAttributes['data-document-id']).toEqual(documentId);
		// @ts-ignore
		expect(dataAttributes['data-document-stage']).toEqual(validFolders[0].path.split('/')[0]);
		// @ts-ignore
		expect(dataAttributes['data-document-type']).toEqual(validFolders[0].path.split('/')[1]);
	});

	it('should render blob host and container', async () => {
		nock('http://test/').get(`/appeals/${validAppealId}`).reply(200, { id: validAppealId });
		nock('http://test/')
			.get(`/appeals/${validAppealId}/document-folders/1`)
			.reply(200, validFolders[0]);

		const response = await request.get(getControllerEndpoint(validAppealId, validFolderId));
		const html = parseHtml(response.text);

		const dataAttributes = processAttrs(html.querySelector('.pins-file-upload')?.attributes);
		// @ts-ignore
		expect(dataAttributes['data-blob-storage-host']).not.toBe(null);
		// @ts-ignore
		expect(dataAttributes['data-blob-storage-container']).not.toBe(null);
	});
});

const processAttrs = (/** @type {NamedNodeMap | undefined} */ attrs) => {
	const items = {};
	if (attrs) {
		for (const item of Object.keys(attrs)) {
			if (item.indexOf('data') === 0) {
				// @ts-ignore
				items[item] = attrs[item];
			}
		}
	}

	return items;
};
