// @ts-nocheck
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';
import { jest } from '@jest/globals';
import { createTestEnvironment } from '#testing/index.js';
import {
	activeDirectoryUsersData,
	appealData,
	documentFileInfo,
	documentFileVersionsInfo,
	documentFolderInfo,
	fileUploadInfo
} from '#testing/app/fixtures/referencedata.js';
import usersService from '#appeals/appeal-users/users-service.js';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';
const appealId = appealData.appealId.toString();
const folderId = documentFolderInfo.folderId;
const { documentId, version } = documentFileVersionsInfo.latestDocumentVersion;

describe('environmental-assessment', () => {
	beforeEach(() => {
		installMockApi();
		// @ts-ignore
		usersService.getUsersByRole = jest.fn().mockResolvedValue(activeDirectoryUsersData);
		// @ts-ignore
		usersService.getUserById = jest.fn().mockResolvedValue(activeDirectoryUsersData[0]);
		// @ts-ignore
		usersService.getUserByRoleAndId = jest.fn().mockResolvedValue(activeDirectoryUsersData[0]);
		nock('http://test/').get(`/appeals/${appealId}`).reply(200, appealData).persist();
		nock('http://test/').post(`/appeals/${appealId}/documents`).reply(200);
		nock('http://test/')
			.get(`/appeals/${appealId}/documents/${documentId}`)
			.reply(200, documentFileInfo)
			.persist();
		nock('http://test/').post(`/appeals/${appealId}/documents/${documentId}`).reply(200);
		nock('http://test/')
			.get(`/appeals/${appealId}/document-folders/${folderId}`)
			.reply(200, documentFolderInfo)
			.persist();
		nock('http://test/')
			.get(`/appeals/${appealId}/documents/${documentId}/versions`)
			.reply(200, documentFileVersionsInfo)
			.persist();
		nock('http://test/')
			.get('/appeals/document-redaction-statuses')
			.reply(200, [{ key: 'no_redaction_required', id: 10 }])
			.persist();
		nock('http://test/')
			.get('/appeals/1/appellant-cases/0')
			.reply(200, { planningObligation: { hasObligation: false } })
			.persist();
	});

	afterEach(() => {
		teardown();
	});

	describe('GET /environmental-assessment/upload-documents/:folderId', () => {
		it('should render the upload documents page', async () => {
			const response = await request.get(
				`${baseUrl}/${appealId}/environmental-assessment/upload-documents/${folderId}`
			);
			expect(response.statusCode).toBe(200);

			const headingElement = parseHtml(response.text);
			expect(headingElement.innerHTML).toMatchSnapshot();
			expect(headingElement.innerHTML).toContain('Upload environmental assessment documents</h1>');
		});
	});

	describe('POST /environmental-assessment/upload-documents/:folderId', () => {
		it(`should eventually redirect to case details page displaying the success banner`, async () => {
			const addDocumentsResponse = await request
				.post(`${baseUrl}/${appealId}/environmental-assessment/upload-documents/${folderId}`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(addDocumentsResponse.statusCode).toBe(302);

			expect(addDocumentsResponse.text).toBe(
				`Found. Redirecting to ${baseUrl}/${appealId}/environmental-assessment/check-your-answers/${folderId}`
			);

			const checkYourAnswersResponse = await request.get(
				`${baseUrl}/${appealId}/environmental-assessment/check-your-answers/${folderId}`
			);

			expect(checkYourAnswersResponse.statusCode).toBe(200);

			const headingElement = parseHtml(checkYourAnswersResponse.text, {
				rootElement: '.govuk-main-wrapper'
			});
			expect(headingElement.innerHTML).toMatchSnapshot();
			expect(headingElement.innerHTML).toContain('Check your answers</h1>');

			const postCheckYourAnswersResponse = await request
				.post(`${baseUrl}/${appealId}/environmental-assessment/check-your-answers/${folderId}`)
				.send({});

			expect(postCheckYourAnswersResponse.statusCode).toBe(302);
			expect(postCheckYourAnswersResponse.text).toBe(
				`Found. Redirecting to ${baseUrl}/${appealId}`
			);

			const caseDetailsResponse = await request.get(`${baseUrl}/${appealId}`);

			expect(caseDetailsResponse.statusCode).toBe(200);

			const element = parseHtml(caseDetailsResponse.text, {
				rootElement: '.govuk-notification-banner'
			});
			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Success</h3>');
			expect(element.innerHTML).toContain('Environmental assessment documents uploaded</p>');
		});
	});

	describe('GET /environmental-assessment/upload-documents/:folderId/:documentId', () => {
		it('should render the upload documents page', async () => {
			const response = await request.get(
				`${baseUrl}/${appealId}/environmental-assessment/upload-documents/${folderId}/${documentId}`
			);
			expect(response.statusCode).toBe(200);

			const headingElement = parseHtml(response.text, { rootElement: '.govuk-main-wrapper' });
			expect(headingElement.innerHTML).toMatchSnapshot();
			expect(headingElement.innerHTML).toContain('Upload an updated document</h1>');
		});
	});

	describe('POST /environmental-assessment/upload-documents/:folderId/:documentId', () => {
		it(`should eventually redirect to case details page displaying the success banner`, async () => {
			const addDocumentsResponse = await request
				.post(
					`${baseUrl}/${appealId}/environmental-assessment/upload-documents/${folderId}/${documentId}`
				)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(addDocumentsResponse.statusCode).toBe(302);

			expect(addDocumentsResponse.text).toBe(
				`Found. Redirecting to ${baseUrl}/${appealId}/environmental-assessment/check-your-answers/${folderId}/${documentId}`
			);

			const checkYourAnswersResponse = await request.get(
				`${baseUrl}/${appealId}/environmental-assessment/check-your-answers/${folderId}/${documentId}`
			);

			expect(checkYourAnswersResponse.statusCode).toBe(200);

			const headingElement = parseHtml(checkYourAnswersResponse.text, {
				rootElement: '.govuk-main-wrapper'
			});
			expect(headingElement.innerHTML).toMatchSnapshot();
			expect(headingElement.innerHTML).toContain('Check your answers</h1>');

			const postCheckYourAnswersResponse = await request
				.post(
					`${baseUrl}/${appealId}/environmental-assessment/check-your-answers/${folderId}/${documentId}`
				)
				.send({});

			expect(postCheckYourAnswersResponse.statusCode).toBe(302);
			expect(postCheckYourAnswersResponse.text).toBe(
				`Found. Redirecting to ${baseUrl}/${appealId}`
			);

			const caseDetailsResponse = await request.get(`${baseUrl}/${appealId}`);

			expect(caseDetailsResponse.statusCode).toBe(200);

			const element = parseHtml(caseDetailsResponse.text, {
				rootElement: '.govuk-notification-banner'
			});
			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Success</h3>');
			expect(element.innerHTML).toContain('Document updated</p>');
		});
	});

	describe('GET /environmental-assessment/manage-documents/:folderId/', () => {
		it('should render the manage documents page', async () => {
			const response = await request.get(
				`${baseUrl}/${appealId}/environmental-assessment/manage-documents/${folderId}`
			);
			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text, { rootElement: '.govuk-main-wrapper' });
			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Manage folder</span>');
			expect(element.innerHTML).toContain('Environmental assessment documents</h1>');

			const unprettifiedHtml = parseHtml(response.text, { skipPrettyPrint: true });
			expect(unprettifiedHtml.innerHTML).toContain(
				`<a href="/appeals-service/appeal-details/${appealId}/environmental-assessment/upload-documents/${folderId}" role="button" draggable="false" class="govuk-button" data-module="govuk-button"> Add documents</a>`
			);
		});
	});

	describe('GET /environmental-assessment/manage-documents/:folderId/:documentId', () => {
		it('should render the manage document page', async () => {
			const response = await request.get(
				`${baseUrl}/${appealId}/environmental-assessment/manage-documents/${folderId}/${documentId}`
			);
			expect(response.statusCode).toBe(200);

			const headingElement = parseHtml(response.text, { rootElement: '.govuk-main-wrapper' });
			expect(headingElement.innerHTML).toMatchSnapshot();
			expect(headingElement.innerHTML).toContain('Manage environmental assessment document</span>');
			expect(headingElement.innerHTML).toContain('View and remove versions of this document</p>');
		});
	});

	describe('GET /environmental-assessment/manage-documents/:folderId/:documentId/:versionId/delete', () => {
		it('should render the delete document version page', async () => {
			const response = await request.get(
				`${baseUrl}/${appealId}/environmental-assessment/manage-documents/${folderId}/${documentId}/${version}/delete`
			);
			expect(response.statusCode).toBe(200);

			const headingElement = parseHtml(response.text, { rootElement: '.govuk-main-wrapper' });
			expect(headingElement.innerHTML).toMatchSnapshot();
			expect(headingElement.innerHTML).toContain(
				'Are you sure you want to remove this version?</h1>'
			);
		});
	});

	describe('POST /environmental-assessment/manage-documents/:folderId/:documentId/:versionId/delete', () => {
		it('should render the delete document version page', async () => {
			nock('http://test/')
				.delete(`/appeals/${appealId}/documents/${documentId}/${version}`)
				.reply(200);

			const response = await request
				.post(
					`${baseUrl}/${appealId}/environmental-assessment/manage-documents/${folderId}/${documentId}/${version}/delete`
				)
				.send({
					'delete-file-answer': 'yes'
				});
			expect(response.statusCode).toBe(302);

			expect(response.text).toBe(`Found. Redirecting to ${baseUrl}/${appealId}`);
		});
	});
});
