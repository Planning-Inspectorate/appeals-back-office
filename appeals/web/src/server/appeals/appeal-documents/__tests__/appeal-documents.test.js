import {
	appellantCaseDataNotValidated,
	documentFileVersionsInfo
} from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import { APPEAL_REDACTED_STATUS } from '@planning-inspectorate/data-model';
import nock from 'nock';
import supertest from 'supertest';
import { mapDocumentDownloadUrl, mapRedactionStatusKeyToName } from '../appeal-documents.mapper.js';

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

describe('appeal-documents', () => {
	beforeEach(() => {
		installMockApi();
		nock('http://test/')
			.get('/appeals/1/appellant-cases/0')
			.reply(200, appellantCaseDataNotValidated);
	});

	afterEach(() => {
		teardown();
	});

	describe('upload', () => {
		beforeEach(() => {
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataNotValidated);
		});

		it('should return 404 if appeal ID is not found', async () => {
			nock('http://test/').get(`/appeals/${invalidAppealId}?include=all`).reply(404);
			nock('http://test/').get(`/appeals/${invalidAppealId}/document-folders/1`).reply(404);

			const response = await request.get(getControllerEndpoint(invalidAppealId, invalidFolderId));

			expect(response.statusCode).toBe(404);
		});

		it('should return 404 if folder ID is not found', async () => {
			nock('http://test/')
				.get(`/appeals/${validAppealId}?include=all`)
				.reply(200, { id: validAppealId });
			nock('http://test/')
				.get(`/appeals/${validAppealId}/document-folders/1`)
				.reply(200, validFolders);

			const response = await request.get(getControllerEndpoint(validAppealId, invalidFolderId));
			expect(response.status).toBe(404);
		});

		it('should return 404 if document ID is not found', async () => {
			nock('http://test/')
				.get(`/appeals/${validAppealId}?include=all`)
				.reply(200, { id: validAppealId });
			nock('http://test/')
				.get(`/appeals/${validAppealId}/document-folders/1`)
				.reply(200, validFolders[0]);
			nock('http://test/').get(`/appeals/documents/${documentId}`).reply(404);

			const response = await request.get(
				getControllerEndpoint(validAppealId, validFolderId, documentId)
			);
			expect(response.status).toBe(404);
		});

		it('should render upload form if appeal ID and folder ID are found', async () => {
			nock('http://test/')
				.get(`/appeals/${validAppealId}?include=all`)
				.reply(200, { id: validAppealId });
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
			expect(unprettifiedElement.innerHTML).toContain('Choose files</button>');
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});

		it('should render upload form if appeal ID, folder ID and document ID are found', async () => {
			nock('http://test/')
				.get(`/appeals/${validAppealId}?include=all`)
				.reply(200, { id: validAppealId });
			nock('http://test/')
				.get(`/appeals/${validAppealId}/document-folders/1`)
				.reply(200, validFolders[0]);
			nock('http://test/')
				.get(`/appeals/documents/${documentId}`)
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
				.get(`/appeals/documents/${documentId}/versions`)
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
			nock('http://test/')
				.get(`/appeals/${validAppealId}?include=all`)
				.reply(200, { id: validAppealId });
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
			nock('http://test/')
				.get(`/appeals/${validAppealId}?include=all`)
				.reply(200, { id: validAppealId });
			nock('http://test/')
				.get(`/appeals/${validAppealId}/document-folders/1`)
				.reply(200, validFolders[0]);
			nock('http://test/')
				.get(`/appeals/documents/${documentId}`)
				.reply(200, { latestDocumentVersion: {} });
			nock('http://test/')
				.get(`/appeals/documents/${documentId}/versions`)
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
			nock('http://test/')
				.get(`/appeals/${validAppealId}?include=all`)
				.reply(200, { id: validAppealId });
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

	describe('update-filename', () => {
		const fullUrl = `/appeals-service/appeal-details/${validAppealId}/appellant-case/change-document-name/${validFolderId}/${documentId}`;
		const documentName = 'sample.doc';
		const fileInfo = {
			name: documentName,
			latestDocumentVersion: {
				originalFilename: 'original-abc',
				redactionStatus: 2,
				dateReceived: new Date().toISOString()
			}
		};
		// const folder = { document: { documents: [fileInfo], name: validDocumentName }};
		const folder = {
			folderId: validFolderId,
			path: 'appellantCase/newSupportingDocuments',
			caseId: validAppealId,
			documents: [fileInfo],
			name: documentName
		};

		beforeEach(() => {
			nock('http://test/')
				.get(`/appeals/${validAppealId}?include=all`)
				.reply(200, { id: validAppealId });
			nock('http://test/').get(`/appeals/${validAppealId}/document-folders/1`).reply(200, folder);
			nock('http://test/').get(`/appeals/documents/${documentId}`).reply(200, fileInfo);
			nock('http://test/').get('/appeals/document-redaction-statuses').reply(200, []);
			nock('http://test/')
				.patch(`/appeals/${validAppealId}/documents/${documentId}`)
				.reply(200, {});
		});

		it('should render change filename page', async () => {
			const response = await request.get(fullUrl);
			expect(response.statusCode).toBe(200);
			const element = parseHtml(response.text, {
				skipPrettyPrint: true
			}).innerHTML;

			expect(element).toContain('Change document details');
			expect(element).toContain(fileInfo.latestDocumentVersion.originalFilename);
			expect(element).toContain(fileInfo.name.substring(0, fileInfo.name.lastIndexOf('.')));
		});

		it('should redirect to manage documents page after change document name success', async () => {
			const response = await request
				.post(fullUrl)
				.send({ fileName: 'valid-fileName_123', documentId });
			expect(response.statusCode).toBe(302);
			expect(response.text).toContain(
				`Found. Redirecting to ${fullUrl.replace('change-document-name', 'manage-documents')}`
			);
		});

		it('should render change filename page with blank filename error', async () => {
			const response = await request.post(fullUrl).send({});
			expect(response.statusCode).toBe(200);
			const element = parseHtml(response.text, {
				skipPrettyPrint: true
			}).innerHTML;

			expect(element).toContain('File name must be entered');
		});

		it('should render change filename page with invalid filename error when there are invalid characters', async () => {
			const response = await request.post(fullUrl).send({
				fileName: 'invalid**characters'
			});
			expect(response.statusCode).toBe(200);
			const element = parseHtml(response.text, {
				skipPrettyPrint: true
			}).innerHTML;

			expect(element).toContain(
				'>File name must only include letters a to z, numbers 0 to 9 and special characters such as hyphens and underscores'
			);
		});

		it('should render change filename page with invalid filename error when there are spaces', async () => {
			const response = await request.post(fullUrl).send({
				fileName: 'invalid. characters'
			});
			expect(response.statusCode).toBe(200);
			const element = parseHtml(response.text, {
				skipPrettyPrint: true
			}).innerHTML;

			expect(element).toContain(
				'>File name must only include letters a to z, numbers 0 to 9 and special characters such as hyphens and underscores'
			);
		});

		it('should render change filename page with duplicate filename error', async () => {
			const response = await request.post(fullUrl).send({
				fileName: documentName.substring(0, documentName.lastIndexOf('.')),
				documentId
			});
			expect(response.statusCode).toBe(200);
			const element = parseHtml(response.text, {
				skipPrettyPrint: true
			}).innerHTML;

			expect(element).toContain('File name already exists within New supporting documents');
		});
	});

	describe('mapRedactionStatusKeyToName', () => {
		it('Should return `Redacted` when the redaction status key is APPEAL_REDACTED_STATUS.REDACTED', async () => {
			const result = mapRedactionStatusKeyToName(APPEAL_REDACTED_STATUS.REDACTED);
			expect(result).toBe('Redacted');
		});

		it('Should return `Unredacted` when the redaction status key is APPEAL_REDACTED_STATUS.NOT_REDACTED', async () => {
			const result = mapRedactionStatusKeyToName(APPEAL_REDACTED_STATUS.NOT_REDACTED);
			expect(result).toBe('Unredacted');
		});

		it('Should return `No redaction required` when the redaction status key is APPEAL_REDACTED_STATUS.NO_REDACTED_REQUIRED', async () => {
			const result = mapRedactionStatusKeyToName(APPEAL_REDACTED_STATUS.NO_REDACTION_REQUIRED);
			expect(result).toBe('No redaction required');
		});

		it('Should return empty string when the redaction status key is not valid redaction status key', async () => {
			const result = mapRedactionStatusKeyToName('123');
			expect(result).toBe('');
		});
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

describe('mapDocumentDownloadUrl', () => {
	it('should return the correct URL when documentVersion is provided', () => {
		const result = mapDocumentDownloadUrl(1, '2', 'document.pdf', 3);
		expect(result).toBe('/documents/1/download/2/3/document.pdf');
	});

	it('should return the correct URL when documentVersion is not provided', () => {
		const result = mapDocumentDownloadUrl(1, '2', 'document.pdf');
		expect(result).toBe('/documents/1/download/2/document.pdf');
	});

	it('should handle appealId as a string', () => {
		const result = mapDocumentDownloadUrl('1', '2', 'document.pdf', 4);
		expect(result).toBe('/documents/1/download/2/4/document.pdf');
	});

	it('should handle special characters in the filename safely', () => {
		const result = mapDocumentDownloadUrl(1, '2', 'docu ment.pdf');
		expect(result).toBe('/documents/1/download/2/docu ment.pdf');
	});

	it('should handle missing filename gracefully', () => {
		const result = mapDocumentDownloadUrl(1, '2', '');
		expect(result).toBe('/documents/1/download/2/');
	});
});
