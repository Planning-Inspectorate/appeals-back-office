// @ts-nocheck
import {
	documentFileInfo,
	documentFileVersionsInfo,
	documentRedactionStatuses,
	fileUploadInfo,
	inquiryDocumentsFolderInfo
} from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { jest } from '@jest/globals';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';

const getFolderApiUrl = (folderId) =>
	`/appeals/1/document-folders/${folderId}?pageNumber=1&pageSize=100`;

const inquiryDocsFolderId = inquiryDocumentsFolderInfo.folderId;

describe('inquiry documents', () => {
	beforeEach(() => {
		installMockApi();
		nock('http://test/')
			.get('/appeals/document-redaction-statuses')
			.reply(200, documentRedactionStatuses)
			.persist();
		nock('http://test/').get(getFolderApiUrl(1)).reply(200, inquiryDocumentsFolderInfo).persist();
		nock('http://test/').get('/appeals/documents/1').reply(200, documentFileInfo);
		nock('http://test/').post('/appeals/validate-business-date').reply(200, true).persist();
	});

	afterEach(teardown);

	afterAll(() => {
		nock.cleanAll();
		nock.restore();
		jest.resetAllMocks();
	});

	describe('GET /inquiry/documents/upload-documents/:folderId', () => {
		it(`should render the upload documents page`, async () => {
			const response = await request.get(
				`${baseUrl}/1/inquiry/documents/upload-documents/${inquiryDocsFolderId}`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(`Upload inquiry documents</h1>`);
			expect(unprettifiedElement.innerHTML).toContain(
				'<div class="govuk-grid-row pins-file-upload"'
			);
			expect(unprettifiedElement.innerHTML).toContain('Choose files</button>');
		});
	});

	describe('POST /inquiry/documents/upload-documents/:folderId', () => {
		it(`should render a 500 error page if upload-info is not present in the request body`, async () => {
			const response = await request
				.post(`${baseUrl}/1/inquiry/documents/upload-documents/${inquiryDocsFolderId}`)
				.send({});

			expect(response.statusCode).toBe(500);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Sorry, there is a problem with the service</h1>'
			);
		});

		it(`should render a 500 error page if request body upload-info is in an incorrect format`, async () => {
			const response = await request
				.post(`${baseUrl}/1/inquiry/documents/upload-documents/${inquiryDocsFolderId}`)
				.send({
					'upload-info': ''
				});

			expect(response.statusCode).toBe(500);

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Sorry, there is a problem with the service</h1>'
			);
		});

		it(`should redirect to the add document details page if upload-info is present in the request body and in the correct format`, async () => {
			const response = await request
				.post(`${baseUrl}/1/inquiry/documents/upload-documents/${inquiryDocsFolderId}`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				`Found. Redirecting to /appeals-service/appeal-details/1/inquiry/documents/add-document-details/${inquiryDocsFolderId}`
			);
		});
	});

	describe('GET /inquiry/documents/upload-documents/:folderId/:documentId', () => {
		beforeEach(() => {
			nock('http://test/')
				.get('/appeals/documents/1/versions')
				.reply(200, documentFileVersionsInfo);
		});

		it(`should render the upload document version page for document`, async () => {
			const response = await request.get(
				`${baseUrl}/1/inquiry/documents/upload-documents/${inquiryDocsFolderId}/1`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain(`inquiry documents</h1>`);
			expect(element.innerHTML).toContain('<div class="govuk-grid-row pins-file-upload"');
			expect(element.innerHTML).toContain('Choose file</button>');
		});
	});

	describe('POST /inquiry/documents/upload-documents/:folderId/:documentId', () => {
		it(`should render a 500 error page if upload-info is not present in the request body`, async () => {
			const response = await request
				.post(`${baseUrl}/1/inquiry/documents/upload-documents/${inquiryDocsFolderId}/1`)
				.send({});

			expect(response.statusCode).toBe(500);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Sorry, there is a problem with the service</h1>'
			);
		});

		it(`should render a 500 error page if request body upload-info is in an incorrect format`, async () => {
			const response = await request
				.post(`${baseUrl}/1/inquiry/documents/upload-documents/${inquiryDocsFolderId}/1`)
				.send({
					'upload-info': ''
				});

			expect(response.statusCode).toBe(500);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Sorry, there is a problem with the service</h1>'
			);
		});

		it(`should redirect to the add document details page if upload-info is present in the request body and in the correct format`, async () => {
			const response = await request
				.post(`${baseUrl}/1/inquiry/documents/upload-documents/${inquiryDocsFolderId}/1`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				`Found. Redirecting to /appeals-service/appeal-details/1/inquiry/documents/add-document-details/${inquiryDocsFolderId}/1`
			);
		});
	});

	describe('GET /inquiry/documents/add-document-details/:folderId', () => {
		beforeEach(() => {
			nock.cleanAll();
			installMockApi();
			nock('http://test/').post('/appeals/validate-business-date').reply(200, true).persist();
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses)
				.persist();
			nock('http://test/').get(getFolderApiUrl(1)).reply(200, inquiryDocumentsFolderInfo).persist();
			nock('http://test/').get('/appeals/documents/1').reply(200, documentFileInfo);
		});

		it(`should render a 500 error page if fileUploadInfo is not present in the session`, async () => {
			const response = await request.get(
				`${baseUrl}/1/inquiry/documents/add-document-details/${inquiryDocsFolderId}`
			);

			expect(response.statusCode).toBe(500);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Sorry, there is a problem with the service</h1>'
			);
		});

		it(`should render the document details page with one item per uploaded document`, async () => {
			const addDocumentsResponse = await request
				.post(`${baseUrl}/1/inquiry/documents/upload-documents/${inquiryDocsFolderId}`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request.get(
				`${baseUrl}/1/inquiry/documents/add-document-details/${inquiryDocsFolderId}`
			);

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
			expect(unprettifiedElement.innerHTML).toContain(`Inquiry document</h1>`);
			expect(unprettifiedElement.innerHTML).toContain('test-document.txt</h2>');
			expect(unprettifiedElement.innerHTML).toContain('Date received</legend>');
			expect(unprettifiedElement.innerHTML).toContain('Redaction status</legend>');
		});

		it(`should render a back link to the upload document page`, async () => {
			const addDocumentsResponse = await request
				.post(`${baseUrl}/1/inquiry/documents/upload-documents/${inquiryDocsFolderId}`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request.get(
				`${baseUrl}/1/inquiry/documents/add-document-details/${inquiryDocsFolderId}`
			);
			const element = parseHtml(response.text, {
				rootElement: '.govuk-back-link',
				skipPrettyPrint: true
			});

			expect(element.innerHTML).toContain(
				`href="/appeals-service/appeal-details/1/inquiry/documents/upload-documents/${inquiryDocsFolderId}"`
			);
		});
	});

	describe('POST /inquiry/documents/add-document-details/:folderId', () => {
		beforeEach(async () => {
			nock('http://test/')
				.patch('/appeals/1/documents')
				.reply(200, {
					documents: [
						{
							id: '4541e025-00e1-4458-aac6-d1b51f6ae0a7',
							receivedDate: '2023-02-01',
							redactionStatus: 2
						}
					]
				});
		});

		it(`should render the document details form with errors when submission fails validation`, async () => {
			const addDocumentsResponse = await request
				.post(`${baseUrl}/1/inquiry/documents/upload-documents/${inquiryDocsFolderId}`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request
				.post(`${baseUrl}/1/inquiry/documents/add-document-details/${inquiryDocsFolderId}`)
				.send({
					'document-name': 'test-document.txt',
					'received-date-day': '',
					'received-date-month': '',
					'received-date-year': '',
					'redaction-status': ''
				});

			expect(response.statusCode).toBe(200);
			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
		});

		it(`should redirect to check your answers when all validation passes`, async () => {
			const addDocumentsResponse = await request
				.post(`${baseUrl}/1/inquiry/documents/upload-documents/${inquiryDocsFolderId}`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request
				.post(`${baseUrl}/1/inquiry/documents/add-document-details/${inquiryDocsFolderId}`)
				.send({
					guid: 'fealeerkal',
					'document-name': 'test-document.txt',
					'received-date-day': '01',
					'received-date-month': '06',
					'received-date-year': '2026',
					'redaction-status': 'not_redacted'
				});

			expect(response.statusCode).toBe(200);
		});
	});

	describe('GET /inquiry/documents/add-document-details/:folderId/:documentId', () => {
		beforeEach(() => {
			nock('http://test/')
				.get('/appeals/documents/1/versions')
				.reply(200, documentFileVersionsInfo);
		});

		it(`should render a 500 error page if fileUploadInfo is not present in the session`, async () => {
			const response = await request.get(
				`${baseUrl}/1/inquiry/documents/add-document-details/${inquiryDocsFolderId}/1`
			);

			expect(response.statusCode).toBe(500);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Sorry, there is a problem with the service</h1>'
			);
		});

		it(`should render the document details page with new uploaded version`, async () => {
			const uploadDocumentResponse = await request
				.post(`${baseUrl}/1/inquiry/documents/upload-documents/${inquiryDocsFolderId}`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(uploadDocumentResponse.statusCode).toBe(302);

			const addDetailsResponse = await request
				.post(`${baseUrl}/1/inquiry/documents/add-document-details/${inquiryDocsFolderId}/1`)
				.send({
					'document-name': 'test-document.txt',
					'received-date-day': '01',
					'received-date-month': '06',
					'received-date-year': '2026',
					'redaction-status': 'not_redacted'
				});

			expect(addDetailsResponse.statusCode).toBe(200);

			const response = await request.get(
				`${baseUrl}/1/inquiry/documents/add-document-details/${inquiryDocsFolderId}/1`
			);

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
			expect(unprettifiedElement.innerHTML).toContain(`Inquiry document</h1>`);
			expect(unprettifiedElement.innerHTML).toContain('test-document.txt</h2>');
			expect(unprettifiedElement.innerHTML).toContain('Date received</legend>');
			expect(unprettifiedElement.innerHTML).toContain('Redaction status</legend>');
		});

		it(`should render a back link to the check your answers page`, async () => {
			const uploadDocumentResponse = await request
				.post(`${baseUrl}/1/inquiry/documents/upload-documents/${inquiryDocsFolderId}`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(uploadDocumentResponse.statusCode).toBe(302);

			const addDetailsResponse = await request
				.post(`${baseUrl}/1/inquiry/documents/add-document-details/${inquiryDocsFolderId}/1`)
				.send({
					'document-name': 'test-document.txt',
					'received-date-day': '01',
					'received-date-month': '06',
					'received-date-year': '2026',
					'redaction-status': 'not_redacted'
				});

			expect(addDetailsResponse.statusCode).toBe(200);

			const response = await request.get(
				`${baseUrl}/1/inquiry/documents/add-document-details/${inquiryDocsFolderId}/1`
			);

			const element = parseHtml(response.text, {
				rootElement: '.govuk-back-link',
				skipPrettyPrint: true
			});

			expect(element.innerHTML).toContain(
				`href="/appeals-service/appeal-details/1/inquiry/documents/upload-documents/${inquiryDocsFolderId}"`
			);
		});
	});

	describe('GET /inquiry/documents/check-your-answers/:folderId', () => {
		it(`should render a 500 error page if document details are not in the session`, async () => {
			const response = await request.get(
				`${baseUrl}/1/inquiry/documents/check-your-answers/${inquiryDocsFolderId}`
			);

			expect(response.statusCode).toBe(500);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Sorry, there is a problem with the service</h1>'
			);
		});

		it(`should render the check your answers page with document details`, async () => {
			const uploadDocumentResponse = await request
				.post(`${baseUrl}/1/inquiry/documents/upload-documents/${inquiryDocsFolderId}`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(uploadDocumentResponse.statusCode).toBe(302);

			const addDetailsResponse = await request
				.post(`${baseUrl}/1/inquiry/documents/add-document-details/${inquiryDocsFolderId}`)
				.send({
					'document-name': 'test-document.txt',
					'received-date-day': '01',
					'received-date-month': '06',
					'received-date-year': '2026',
					'redaction-status': 'not_redacted'
				});

			expect(addDetailsResponse.statusCode).toBe(200);

			const response = await request.get(
				`${baseUrl}/1/inquiry/documents/check-your-answers/${inquiryDocsFolderId}/1`
			);

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Check your answers</h1>');
			expect(unprettifiedElement.innerHTML).toContain('test-document.txt');
			expect(unprettifiedElement.innerHTML).toContain('Date received');
			expect(unprettifiedElement.innerHTML).toContain('No redaction required');
		});
	});

	describe('POST /inquiry/documents/check-your-answers/:folderId', () => {
		it(`should save document and redirect to appeal details`, async () => {
			nock('http://test/')
				.post('/appeals/1/document-folders/1/documents')
				.reply(201, { documentId: '52694ab0-20fd-4a11-9553-51514de62f2d' });

			const uploadDocumentResponse = await request
				.post(`${baseUrl}/1/inquiry/documents/upload-documents/${inquiryDocsFolderId}`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(uploadDocumentResponse.statusCode).toBe(302);

			const addDetailsResponse = await request
				.post(`${baseUrl}/1/inquiry/documents/add-document-details/${inquiryDocsFolderId}`)
				.send({
					'document-name': 'test-document.txt',
					'received-date-day': '01',
					'received-date-month': '06',
					'received-date-year': '2026',
					'redaction-status': 'not_redacted'
				});

			expect(addDetailsResponse.statusCode).toBe(200);

			const response = await request
				.post(`${baseUrl}/1/inquiry/documents/check-your-answers/${inquiryDocsFolderId}`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(response.statusCode).toBe(302);
			expect(response.text).toContain(`/appeals-service/appeal-details/1`);
		});
	});

	describe('GET /inquiry/documents/check-your-answers/:folderId/:documentId', () => {
		beforeEach(() => {
			nock('http://test/')
				.get('/appeals/documents/1/versions')
				.reply(200, documentFileVersionsInfo);
		});

		it(`should render a 500 error page if document details are not in the session`, async () => {
			const response = await request.get(
				`${baseUrl}/1/inquiry/documents/check-your-answers/${inquiryDocsFolderId}/1`
			);

			expect(response.statusCode).toBe(500);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Sorry, there is a problem with the service</h1>'
			);
		});

		it(`should render the check your answers page with new document version details`, async () => {
			const uploadDocumentResponse = await request
				.post(`${baseUrl}/1/inquiry/documents/upload-documents/${inquiryDocsFolderId}`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(uploadDocumentResponse.statusCode).toBe(302);

			const addDetailsResponse = await request
				.post(`${baseUrl}/1/inquiry/documents/add-document-details/${inquiryDocsFolderId}`)
				.send({
					'document-name': 'test-document.txt',
					'received-date-day': '01',
					'received-date-month': '06',
					'received-date-year': '2026',
					'redaction-status': 'not_redacted'
				});

			expect(addDetailsResponse.statusCode).toBe(200);

			const versionUploadResponse = await request
				.post(`${baseUrl}/1/inquiry/documents/upload-documents/${inquiryDocsFolderId}/1`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(versionUploadResponse.statusCode).toBe(302);

			const response = await request.get(
				`${baseUrl}/1/inquiry/documents/check-your-answers/${inquiryDocsFolderId}/1`
			);

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Check your answers</h1');
			expect(unprettifiedElement.innerHTML).toContain('test-document.txt');
		});
	});

	describe('GET /inquiry/documents/manage-documents/:folderId', () => {
		it(`should render the inquiry documents folder page`, async () => {
			const response = await request.get(
				`${baseUrl}/1/inquiry/documents/manage-documents/${inquiryDocsFolderId}`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Inquiry documents</h1>');
			expect(unprettifiedElement.innerHTML).toContain('test-pdf-documentFolderInfo.pdf');
		});
	});

	describe('GET /inquiry/documents/manage-documents/:folderId/:documentId', () => {
		beforeEach(() => {
			nock('http://test/')
				.get('/appeals/documents/1/versions')
				.reply(200, documentFileVersionsInfo);
		});

		it(`should render the manage document page`, async () => {
			const response = await request.get(
				`${baseUrl}/1/inquiry/documents/manage-documents/${inquiryDocsFolderId}/1`
			);

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();
		});
	});
});
