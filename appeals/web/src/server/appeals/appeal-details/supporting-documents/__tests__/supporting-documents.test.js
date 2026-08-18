// @ts-nocheck
import usersService from '#appeals/appeal-users/users-service.js';
import { dateISOStringToDisplayDate } from '#lib/dates.js';
import {
	activeDirectoryUsersData,
	appealData,
	documentFileInfo,
	documentFileVersionsInfo,
	documentFileVersionsInfoChecked,
	documentFileVersionsInfoNotChecked,
	documentFileVersionsInfoVirusFound,
	documentRedactionStatuses,
	fileUploadInfo,
	supportingDocumentsFolderInfo
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

const supportingDocsFolderId = supportingDocumentsFolderInfo.folderId;

describe('supporting documents', () => {
	afterAll(() => {
		nock.cleanAll();
		nock.restore();
		jest.resetAllMocks();
	});
	beforeAll(() => {
		jest.resetAllMocks();
	});

	beforeEach(() => {
		installMockApi();
		nock('http://test/')
			.get('/appeals/document-redaction-statuses')
			.reply(200, documentRedactionStatuses)
			.persist();
		nock('http://test/')
			.get(getFolderApiUrl(1))
			.reply(200, supportingDocumentsFolderInfo)
			.persist();
		nock('http://test/').get('/appeals/documents/1').reply(200, documentFileInfo);
		nock('http://test/').post('/appeals/validate-business-date').reply(200, true).persist();
	});
	afterEach(teardown);

	describe('supporting documents', () => {
		describe('GET /supporting-documents/upload-documents/:folderId', () => {
			it(`should render the upload documents page`, async () => {
				const response = await request.get(
					`${baseUrl}/1/supporting-documents/upload-documents/${supportingDocsFolderId}`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain(`Upload supporting document</h1>`);
				expect(unprettifiedElement.innerHTML).toContain(
					'<div class="govuk-grid-row pins-file-upload"'
				);
				expect(unprettifiedElement.innerHTML).toContain('Choose files</button>');
			});
		});

		describe('POST /supporting-documents/upload-documents/:folderId', () => {
			it(`should render a 500 error page if upload-info is not present in the request body`, async () => {
				const response = await request
					.post(`${baseUrl}/1/supporting-documents/upload-documents/${supportingDocsFolderId}`)
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
					.post(`${baseUrl}/1/supporting-documents/upload-documents/${supportingDocsFolderId}`)
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
					.post(`${baseUrl}/1/supporting-documents/upload-documents/${supportingDocsFolderId}`)
					.send({
						'upload-info': fileUploadInfo
					});

				expect(response.statusCode).toBe(302);
				expect(response.text).toBe(
					`Found. Redirecting to /appeals-service/appeal-details/1/supporting-documents/add-document-details/${supportingDocsFolderId}`
				);
			});
		});

		describe('GET /supporting-documents/upload-documents/:folderId/:documentId', () => {
			beforeEach(() => {
				nock('http://test/')
					.get('/appeals/documents/1/versions')
					.reply(200, documentFileVersionsInfo);
			});

			it(`should render the upload document version page for document`, async () => {
				const response = await request.get(
					`${baseUrl}/1/supporting-documents/upload-documents/${supportingDocsFolderId}/1`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();
				expect(element.innerHTML).toContain(`Supporting documents</h1>`);
				expect(element.innerHTML).toContain('<div class="govuk-grid-row pins-file-upload"');
				expect(element.innerHTML).toContain('Choose file</button>');
			});
		});

		describe('POST /supporting-documents/upload-documents/:folderId/:documentId', () => {
			it(`should render a 500 error page if upload-info is not present in the request body`, async () => {
				const response = await request
					.post(`${baseUrl}/1/supporting-documents/upload-documents/${supportingDocsFolderId}/1`)
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
					.post(`${baseUrl}/1/supporting-documents/upload-documents/${supportingDocsFolderId}/1`)
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
					.post(`${baseUrl}/1/supporting-documents/upload-documents/${supportingDocsFolderId}/1`)
					.send({
						'upload-info': fileUploadInfo
					});

				expect(response.statusCode).toBe(302);
				expect(response.text).toBe(
					`Found. Redirecting to /appeals-service/appeal-details/1/supporting-documents/add-document-details/${supportingDocsFolderId}/1`
				);
			});
		});

		describe('GET /supporting-documents/add-document-details/:folderId', () => {
			it(`should render a 500 error page if fileUploadInfo is not present in the session`, async () => {
				const response = await request.get(
					`${baseUrl}/1/supporting-documents/add-document-details/${supportingDocsFolderId}`
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
					.post(`${baseUrl}/1/supporting-documents/upload-documents/${supportingDocsFolderId}`)
					.send({
						'upload-info': fileUploadInfo
					});

				expect(addDocumentsResponse.statusCode).toBe(302);

				const response = await request.get(
					`${baseUrl}/1/supporting-documents/add-document-details/${supportingDocsFolderId}`
				);

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
				expect(unprettifiedElement.innerHTML).toContain(`Supporting document</h1>`);
				expect(unprettifiedElement.innerHTML).toContain('test-document.txt</h2>');
				expect(unprettifiedElement.innerHTML).toContain('Date received</legend>');
				expect(unprettifiedElement.innerHTML).toContain('Redaction status</legend>');
			});

			it(`should render a back link to the upload document page`, async () => {
				const addDocumentsResponse = await request
					.post(`${baseUrl}/1/supporting-documents/upload-documents/${supportingDocsFolderId}`)
					.send({
						'upload-info': fileUploadInfo
					});

				expect(addDocumentsResponse.statusCode).toBe(302);

				const response = await request.get(
					`${baseUrl}/1/supporting-documents/add-document-details/${supportingDocsFolderId}`
				);
				const element = parseHtml(response.text, {
					rootElement: '.govuk-back-link',
					skipPrettyPrint: true
				});

				expect(element.innerHTML).toContain(
					`href="/appeals-service/appeal-details/1/supporting-documents/upload-documents/${supportingDocsFolderId}"`
				);
			});
		});

		describe('POST /supporting-documents/add-document-details/:folderId', () => {
			/**
			 * @type {import("superagent").Response}
			 */
			let addDocumentsResponse;

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

				addDocumentsResponse = await request
					.post(`${baseUrl}/1/supporting-documents/upload-documents/${supportingDocsFolderId}`)
					.send({
						'upload-info': fileUploadInfo
					});
			});

			let expectedH1Text = `Supporting document`;

			it(`should re-render the document details page with the expected error message if the request body is in an incorrect format`, async () => {
				expect(addDocumentsResponse.statusCode).toBe(302);

				const response = await request
					.post(`${baseUrl}/1/supporting-documents/add-document-details/${supportingDocsFolderId}`)
					.send({});

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
				expect(unprettifiedElement.innerHTML).toContain(`${expectedH1Text}</h1>`);

				const errorSummaryElement = parseHtml(response.text, {
					rootElement: '.govuk-error-summary'
				});

				expect(errorSummaryElement.innerHTML).toContain('There is a problem with the service');
			});

			it(`should re-render the document details page with the expected error message if receivedDate day is an invalid value`, async () => {
				expect(addDocumentsResponse.statusCode).toBe(302);

				const testCases = [
					{
						value: '',
						expectedError: `Supporting document date must include a day`
					},
					{
						value: 'a',
						expectedError: `Supporting document date day must be a number`
					},
					{
						value: '0',
						expectedError: `Supporting document date day must be between 1 and 31`
					},
					{
						value: '32',
						expectedError: `Supporting document date day must be between 1 and 31`
					}
				];

				for (const testCase of testCases) {
					const response = await request
						.post(
							`${baseUrl}/1/supporting-documents/add-document-details/${supportingDocsFolderId}`
						)
						.send({
							items: [
								{
									documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
									receivedDate: {
										day: testCase.value,
										month: '2',
										year: '2030'
									},
									redactionStatus: 2
								}
							]
						});

					const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

					expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
					expect(unprettifiedElement.innerHTML).toContain(`${expectedH1Text}</h1>`);

					const errorSummaryElement = parseHtml(response.text, {
						rootElement: '.govuk-error-summary'
					});

					expect(errorSummaryElement.innerHTML).toContain(testCase.expectedError);
				}
			});

			it(`should re-render the document details page with the expected error message if receivedDate month is an invalid value`, async () => {
				expect(addDocumentsResponse.statusCode).toBe(302);

				const testCases = [
					{
						value: '',
						expectedError: `Supporting document date must include a month`
					},
					{
						value: 'a',
						expectedError: `Supporting document date must be a real date`
					},
					{
						value: '0',
						expectedError: `Supporting document date month must be between 1 and 12`
					},
					{
						value: '13',
						expectedError: `Supporting document date month must be between 1 and 12`
					}
				];

				for (const testCase of testCases) {
					const response = await request
						.post(
							`${baseUrl}/1/supporting-documents/add-document-details/${supportingDocsFolderId}`
						)
						.send({
							items: [
								{
									documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
									receivedDate: {
										day: '1',
										month: testCase.value,
										year: '2030'
									},
									redactionStatus: 2
								}
							]
						});

					const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

					expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
					expect(unprettifiedElement.innerHTML).toContain(`${expectedH1Text}</h1>`);

					const errorSummaryElement = parseHtml(response.text, {
						rootElement: '.govuk-error-summary'
					});

					expect(errorSummaryElement.innerHTML).toContain(testCase.expectedError);
				}
			});

			it(`should re-render the document details page with the expected error message if receivedDate year is an invalid value`, async () => {
				expect(addDocumentsResponse.statusCode).toBe(302);

				const testCases = [
					{
						value: '',
						expectedError: `Supporting document date must include a year`
					},
					{
						value: 'a',
						expectedError: `Supporting document date year must be a number`
					},
					{
						value: '202',
						expectedError: `Supporting document date year must be 4 digits`
					}
				];

				for (const testCase of testCases) {
					const response = await request
						.post(
							`${baseUrl}/1/supporting-documents/add-document-details/${supportingDocsFolderId}`
						)
						.send({
							items: [
								{
									documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
									receivedDate: {
										day: '1',
										month: '2',
										year: testCase.value
									},
									redactionStatus: 2
								}
							]
						});

					const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

					expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
					expect(unprettifiedElement.innerHTML).toContain(`${expectedH1Text}</h1>`);

					const errorSummaryElement = parseHtml(response.text, {
						rootElement: '.govuk-error-summary'
					});

					expect(errorSummaryElement.innerHTML).toContain(testCase.expectedError);
				}
			});

			it(`should re-render the document details page with the expected error message if receivedDate is not a valid date`, async () => {
				expect(addDocumentsResponse.statusCode).toBe(302);

				const response = await request
					.post(`${baseUrl}/1/supporting-documents/add-document-details/${supportingDocsFolderId}`)
					.send({
						items: [
							{
								documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
								receivedDate: {
									day: '29',
									month: '2',
									year: '2023'
								},
								redactionStatus: 2
							}
						]
					});

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
				expect(unprettifiedElement.innerHTML).toContain(`${expectedH1Text}</h1>`);

				const errorSummaryElement = parseHtml(response.text, {
					rootElement: '.govuk-error-summary'
				});

				expect(errorSummaryElement.innerHTML).toContain(
					`Supporting document date must be a real date`
				);
			});

			it(`should send a patch request to the appeal documents endpoint and redirect to the check and confirm page, if complete and valid document details were provided`, async () => {
				expect(addDocumentsResponse.statusCode).toBe(302);

				const response = await request
					.post(`${baseUrl}/1/supporting-documents/add-document-details/${supportingDocsFolderId}`)
					.send({
						items: [
							{
								documentId: '4541e025-00e1-4458-aac6-d1b51f6ae0a7',
								receivedDate: {
									day: '1',
									month: '2',
									year: '2023'
								},
								redactionStatus: 3
							}
						]
					});

				expect(response.statusCode).toBe(302);
				expect(response.text).toEqual(
					`Found. Redirecting to /appeals-service/appeal-details/1/supporting-documents/check-your-answers/${supportingDocsFolderId}`
				);
			});
		});

		describe('GET /supporting-documents/add-document-details/:folderId/:documentId', () => {
			it(`should render a 500 error page if fileUploadInfo is not present in the session`, async () => {
				const response = await request.get(
					`${baseUrl}/1/supporting-documents/add-document-details/${supportingDocsFolderId}/1`
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
					.post(`${baseUrl}/1/supporting-documents/upload-documents/${supportingDocsFolderId}/1`)
					.send({
						'upload-info': fileUploadInfo
					});

				expect(addDocumentsResponse.statusCode).toBe(302);
				expect(addDocumentsResponse.text).toContain(
					`Found. Redirecting to /appeals-service/appeal-details/1/supporting-documents/add-document-details/${supportingDocsFolderId}/1`
				);

				const response = await request.get(
					`${baseUrl}/1/supporting-documents/add-document-details/${supportingDocsFolderId}/1`
				);

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
				expect(unprettifiedElement.innerHTML).toContain(`Supporting document</h1>`);
				expect(unprettifiedElement.innerHTML).toContain('test-document.txt</h2>');
				expect(unprettifiedElement.innerHTML).toContain('Date received</legend>');
				expect(unprettifiedElement.innerHTML).toContain('Redaction status</legend>');
			});

			it(`should render a back link to the upload document version page`, async () => {
				const addDocumentsResponse = await request
					.post(`${baseUrl}/1/supporting-documents/upload-documents/${supportingDocsFolderId}/1`)
					.send({
						'upload-info': fileUploadInfo
					});

				expect(addDocumentsResponse.statusCode).toBe(302);
				expect(addDocumentsResponse.text).toContain(
					`Found. Redirecting to /appeals-service/appeal-details/1/supporting-documents/add-document-details/${supportingDocsFolderId}/1`
				);

				const response = await request.get(
					`${baseUrl}/1/supporting-documents/add-document-details/${supportingDocsFolderId}/1`
				);
				const element = parseHtml(response.text, {
					rootElement: '.govuk-back-link',
					skipPrettyPrint: true
				});

				expect(element.innerHTML).toContain(
					`href="/appeals-service/appeal-details/1/supporting-documents/upload-documents/${supportingDocsFolderId}/1"`
				);
			});
		});

		describe('POST /supporting-documents/add-document-details/:folderId/:documentId', () => {
			/**
			 * @type {import("superagent").Response}
			 */
			let addDocumentsResponse;

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

				addDocumentsResponse = await request
					.post(`${baseUrl}/1/supporting-documents/upload-documents/${supportingDocsFolderId}/1`)
					.send({
						'upload-info': fileUploadInfo
					});
			});

			let expectedH1Text = `Supporting document`;

			it(`should re-render the document details page with the expected error message if the request body is in an incorrect format`, async () => {
				expect(addDocumentsResponse.statusCode).toBe(302);

				const response = await request
					.post(
						`${baseUrl}/1/supporting-documents/add-document-details/${supportingDocsFolderId}/1`
					)
					.send({});

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
				expect(unprettifiedElement.innerHTML).toContain(`${expectedH1Text}</h1>`);

				const errorSummaryElement = parseHtml(response.text, {
					rootElement: '.govuk-error-summary'
				});

				expect(errorSummaryElement.innerHTML).toContain('There is a problem with the service');
			});

			it(`should re-render the document details page with the expected error message if receivedDate day is an invalid value`, async () => {
				expect(addDocumentsResponse.statusCode).toBe(302);

				const testCases = [
					{
						value: '',
						expectedError: `Supporting document date must include a day`
					},
					{
						value: 'a',
						expectedError: `Supporting document date day must be a number`
					},
					{
						value: '0',
						expectedError: `Supporting document date day must be between 1 and 31`
					},
					{
						value: '32',
						expectedError: `Supporting document date day must be between 1 and 31`
					}
				];

				for (const testCase of testCases) {
					const response = await request
						.post(
							`${baseUrl}/1/supporting-documents/add-document-details/${supportingDocsFolderId}/1`
						)
						.send({
							items: [
								{
									documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
									receivedDate: {
										day: testCase.value,
										month: '2',
										year: '2030'
									},
									redactionStatus: 2
								}
							]
						});

					const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

					expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
					expect(unprettifiedElement.innerHTML).toContain(`${expectedH1Text}</h1>`);

					const errorSummaryElement = parseHtml(response.text, {
						rootElement: '.govuk-error-summary'
					});

					expect(errorSummaryElement.innerHTML).toContain(testCase.expectedError);
				}
			});

			it(`should re-render the document details page with the expected error message if receivedDate month is an invalid value`, async () => {
				expect(addDocumentsResponse.statusCode).toBe(302);

				const testCases = [
					{
						value: '',
						expectedError: `Supporting document date must include a month`
					},
					{
						value: 'a',
						expectedError: `Supporting document date must be a real date`
					},
					{
						value: '0',
						expectedError: `Supporting document date month must be between 1 and 12`
					},
					{
						value: '13',
						expectedError: `Supporting document date month must be between 1 and 12`
					}
				];

				for (const testCase of testCases) {
					const response = await request
						.post(
							`${baseUrl}/1/supporting-documents/add-document-details/${supportingDocsFolderId}/1`
						)
						.send({
							items: [
								{
									documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
									receivedDate: {
										day: '1',
										month: testCase.value,
										year: '2030'
									},
									redactionStatus: 2
								}
							]
						});

					const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

					expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
					expect(unprettifiedElement.innerHTML).toContain(`${expectedH1Text}</h1>`);

					const errorSummaryElement = parseHtml(response.text, {
						rootElement: '.govuk-error-summary'
					});

					expect(errorSummaryElement.innerHTML).toContain(testCase.expectedError);
				}
			});

			it(`should re-render the document details page with the expected error message if receivedDate year is an invalid value`, async () => {
				expect(addDocumentsResponse.statusCode).toBe(302);

				const testCases = [
					{
						value: '',
						expectedError: `Supporting document date must include a year`
					},
					{
						value: 'a',
						expectedError: `Supporting document date year must be a number`
					},
					{
						value: '202',
						expectedError: `Supporting document date year must be 4 digits`
					}
				];

				for (const testCase of testCases) {
					const response = await request
						.post(
							`${baseUrl}/1/supporting-documents/add-document-details/${supportingDocsFolderId}/1`
						)
						.send({
							items: [
								{
									documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
									receivedDate: {
										day: '1',
										month: '2',
										year: testCase.value
									},
									redactionStatus: 2
								}
							]
						});

					const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

					expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
					expect(unprettifiedElement.innerHTML).toContain(`${expectedH1Text}</h1>`);

					const errorSummaryElement = parseHtml(response.text, {
						rootElement: '.govuk-error-summary'
					});

					expect(errorSummaryElement.innerHTML).toContain(testCase.expectedError);
				}
			});

			it(`should re-render the document details page with the expected error message if receivedDate is not a valid date`, async () => {
				expect(addDocumentsResponse.statusCode).toBe(302);

				const response = await request
					.post(
						`${baseUrl}/1/supporting-documents/add-document-details/${supportingDocsFolderId}/1`
					)
					.send({
						items: [
							{
								documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
								receivedDate: {
									day: '29',
									month: '2',
									year: '2023'
								},
								redactionStatus: 2
							}
						]
					});

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
				expect(unprettifiedElement.innerHTML).toContain(`${expectedH1Text}</h1>`);

				const errorSummaryElement = parseHtml(response.text, {
					rootElement: '.govuk-error-summary'
				});

				expect(errorSummaryElement.innerHTML).toContain(
					`Supporting document date must be a real date`
				);
			});

			it(`should send a patch request to the appeal documents endpoint and redirect to the check and confirm page, if complete and valid document details were provided`, async () => {
				expect(addDocumentsResponse.statusCode).toBe(302);

				const response = await request
					.post(
						`${baseUrl}/1/supporting-documents/add-document-details/${supportingDocsFolderId}/1`
					)
					.send({
						items: [
							{
								documentId: '4541e025-00e1-4458-aac6-d1b51f6ae0a7',
								receivedDate: {
									day: '1',
									month: '2',
									year: '2023'
								},
								redactionStatus: 2
							}
						]
					});

				expect(response.statusCode).toBe(302);
				expect(response.text).toEqual(
					`Found. Redirecting to /appeals-service/appeal-details/1/supporting-documents/check-your-answers/${supportingDocsFolderId}/1`
				);
			});
		});

		describe('GET /supporting-documents/check-your-answers/:folderId', () => {
			it(`should render a 500 error page if fileUploadInfo is not present in the session`, async () => {
				const response = await request.get(
					`${baseUrl}/1/supporting-documents/check-your-answers/${supportingDocsFolderId}`
				);

				expect(response.statusCode).toBe(500);
				const element = parseHtml(response.text);
				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain(
					'Sorry, there is a problem with the service</h1>'
				);
			});

			it(`should render the add documents check and confirm page with summary list displaying info on the uploaded document and relevant change links`, async () => {
				const addDocumentsResponse = await request
					.post(`${baseUrl}/1/supporting-documents/upload-documents/${supportingDocsFolderId}`)
					.send({
						'upload-info': fileUploadInfo
					});

				expect(addDocumentsResponse.statusCode).toBe(302);

				const response = await request.get(
					`${baseUrl}/1/supporting-documents/check-your-answers/${supportingDocsFolderId}`
				);

				expect(response.statusCode).toBe(200);

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Check your answers</h1>');
				expect(unprettifiedElement.innerHTML).toContain('File</dt>');
				expect(unprettifiedElement.innerHTML).toContain(
					'<a class="govuk-link" href="/documents/APP/Q9999/D/21/351062/download-uncommitted/1/test-document.txt" target="_blank">test-document.txt</a></dd>'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					`<a class="govuk-link" href="/appeals-service/appeal-details/1/supporting-documents/upload-documents/${supportingDocsFolderId}">Change<span class="govuk-visually-hidden"> file test-document.txt</span></a></dd>`
				);
				expect(unprettifiedElement.innerHTML).toContain('Date received</dt>');
				expect(unprettifiedElement.innerHTML).toContain(
					`${dateISOStringToDisplayDate(new Date().toISOString())}</dd>`
				);
				expect(unprettifiedElement.innerHTML).toContain('Redaction status</dt>');
				expect(unprettifiedElement.innerHTML).toContain('No redaction required</dd>');
				expect(unprettifiedElement.innerHTML).toContain(
					`<a class="govuk-link" href="/appeals-service/appeal-details/1/supporting-documents/add-document-details/${supportingDocsFolderId}">Change<span class="govuk-visually-hidden"> test-document.txt date received</span></a></dd>`
				);
				expect(unprettifiedElement.innerHTML).toContain(
					`<a class="govuk-link" href="/appeals-service/appeal-details/1/supporting-documents/add-document-details/${supportingDocsFolderId}">Change<span class="govuk-visually-hidden"> test-document.txt redaction status</span></a></dd>`
				);
				expect(unprettifiedElement.innerHTML).toContain('Confirm</button>');
			});
		});

		describe('POST /supporting-documents/check-your-answers/:folderId', () => {
			it(`should render a 500 error page if fileUploadInfo is not present in the session`, async () => {
				const response = await request
					.post(`${baseUrl}/1/supporting-documents/check-your-answers/${supportingDocsFolderId}`)
					.send({});

				expect(response.statusCode).toBe(500);
				const element = parseHtml(response.text);
				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain(
					'Sorry, there is a problem with the service</h1>'
				);
			});

			it(`should send an API request to create a new document and redirect to the appeal details page`, async () => {
				const mockDocumentsEndpoint = nock('http://test/').post('/appeals/1/documents').reply(200);
				const addDocumentsResponse = await request
					.post(`${baseUrl}/1/supporting-documents/upload-documents/${supportingDocsFolderId}`)
					.send({
						'upload-info': fileUploadInfo
					});

				expect(addDocumentsResponse.statusCode).toBe(302);

				const response = await request
					.post(`${baseUrl}/1/supporting-documents/check-your-answers/${supportingDocsFolderId}`)
					.send({});

				expect(response.statusCode).toBe(302);
				expect(response.text).toBe('Found. Redirecting to /appeals-service/appeal-details/1');
				expect(mockDocumentsEndpoint.isDone()).toBe(true);
			});
		});

		describe('GET /supporting-documents/check-your-answers/:folderId/:documentId', () => {
			it(`should render a 500 error page if fileUploadInfo is not present in the session`, async () => {
				const response = await request.get(
					`${baseUrl}/1/supporting-documents/check-your-answers/${supportingDocsFolderId}/1`
				);

				expect(response.statusCode).toBe(500);
				const element = parseHtml(response.text);
				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain(
					'Sorry, there is a problem with the service</h1>'
				);
			});

			it(`should render the add documents check and confirm page with summary list row displaying info on the uploaded document`, async () => {
				const addDocumentsResponse = await request
					.post(`${baseUrl}/1/supporting-documents/upload-documents/${supportingDocsFolderId}/1`)
					.send({
						'upload-info': fileUploadInfo
					});

				expect(addDocumentsResponse.statusCode).toBe(302);

				const response = await request.get(
					`${baseUrl}/1/supporting-documents/check-your-answers/${supportingDocsFolderId}/1`
				);

				expect(response.statusCode).toBe(200);

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Check your answers</h1>');
				expect(unprettifiedElement.innerHTML).toContain('File</dt>');
				expect(unprettifiedElement.innerHTML).toContain(
					'<a class="govuk-link" href="/documents/APP/Q9999/D/21/351062/download-uncommitted/1/ph0-documentFileInfo.jpeg/2" target="_blank">test-document.txt</a></dd>'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					`<a class="govuk-link" href="/appeals-service/appeal-details/1/supporting-documents/upload-documents/${supportingDocsFolderId}/1">Change<span class="govuk-visually-hidden"> file test-document.txt</span></a></dd>`
				);
				expect(unprettifiedElement.innerHTML).toContain('Date received</dt>');
				expect(unprettifiedElement.innerHTML).toContain(
					`${dateISOStringToDisplayDate(new Date().toISOString())}</dd>`
				);
				expect(unprettifiedElement.innerHTML).toContain('Redaction status</dt>');
				expect(unprettifiedElement.innerHTML).toContain('No redaction required</dd>');
				expect(unprettifiedElement.innerHTML).toContain(
					`<a class="govuk-link" href="/appeals-service/appeal-details/1/supporting-documents/add-document-details/${supportingDocsFolderId}/1">Change<span class="govuk-visually-hidden"> test-document.txt date received</span></a></dd>`
				);
				expect(unprettifiedElement.innerHTML).toContain(
					`<a class="govuk-link" href="/appeals-service/appeal-details/1/supporting-documents/add-document-details/${supportingDocsFolderId}/1">Change<span class="govuk-visually-hidden"> test-document.txt redaction status</span></a></dd>`
				);
				expect(unprettifiedElement.innerHTML).toContain('Confirm</button>');
			});
		});

		describe('POST /supporting-documents/check-your-answers/:folderId/:documentId', () => {
			it(`should render a 500 error page if fileUploadInfo is not present in the session`, async () => {
				const response = await request
					.post(`${baseUrl}/1/supporting-documents/check-your-answers/${supportingDocsFolderId}/1`)
					.send({});

				expect(response.statusCode).toBe(500);
				const element = parseHtml(response.text);
				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain(
					'Sorry, there is a problem with the service</h1>'
				);
			});

			it(`should send an API request to create a new document and redirect to the appeal details page`, async () => {
				const mockDocumentsEndpoint = nock('http://test/')
					.post('/appeals/1/documents/1')
					.reply(200);
				const addDocumentsResponse = await request
					.post(`${baseUrl}/1/supporting-documents/upload-documents/${supportingDocsFolderId}/1`)
					.send({
						'upload-info': fileUploadInfo
					});

				expect(addDocumentsResponse.statusCode).toBe(302);

				const response = await request
					.post(`${baseUrl}/1/supporting-documents/check-your-answers/${supportingDocsFolderId}/1`)
					.send({});

				expect(response.statusCode).toBe(302);
				expect(response.text).toBe('Found. Redirecting to /appeals-service/appeal-details/1');
				expect(mockDocumentsEndpoint.isDone()).toBe(true);
			});
		});

		describe('GET /supporting-documents/manage-documents/:folderId', () => {
			beforeEach(() => {
				usersService.getUserByRoleAndId = jest.fn().mockResolvedValue(activeDirectoryUsersData[0]);
			});

			it(`should render a 404 error page if the folderId is not valid`, async () => {
				const response = await request.get(`${baseUrl}/1/supporting-documents/manage-documents/99`);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();
				expect(element.innerHTML).toContain('Page not found</h1>');
			});

			it(`should render the manage folder page with one document item for each document present in the folder if the folderId is valid`, async () => {
				const response = await request.get(
					`${baseUrl}/1/supporting-documents/manage-documents/${supportingDocsFolderId}`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Manage folder</span><h1');
				expect(unprettifiedElement.innerHTML).toContain(`Supporting documents</h1>`);
				expect(unprettifiedElement.innerHTML).toContain(
					`<a href="/appeals-service/appeal-details/1/supporting-documents/upload-documents/${supportingDocsFolderId}" role="button" draggable="false" class="govuk-button govuk-button--secondary" data-module="govuk-button"> Add document</a>`
				);
			});

			it(`Should render 'Manage and share' CTA and NO tag if document is NOT shared`, async () => {
				nock.cleanAll();
				nock('http://test/').get('/appeals/1/exists').reply(200, appealData).persist();

				const unsharedDocumentFolder = structuredClone(supportingDocumentsFolderInfo);
				unsharedDocumentFolder.documents.forEach((doc) => {
					doc.latestDocumentVersion.published = false;
				});

				nock('http://test/').get(getFolderApiUrl(1)).reply(200, unsharedDocumentFolder);

				const response = await request.get(`${baseUrl}/1/supporting-documents/manage-documents/1`);
				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Manage and share');
				expect(unprettifiedElement.innerHTML).not.toContain(
					'<strong class="govuk-tag govuk-tag--blue govuk-!-margin-right-1">Shared</strong>'
				);
			});

			it(`Should render 'Manage' CTA and 'Shared' tag if document IS shared`, async () => {
				nock.cleanAll();
				nock('http://test/').get('/appeals/1/exists').reply(200, appealData).persist();

				const sharedDocumentFolder = structuredClone(supportingDocumentsFolderInfo);
				sharedDocumentFolder.documents.forEach((doc) => {
					doc.latestDocumentVersion.published = true;
				});

				nock('http://test/').get(getFolderApiUrl(1)).reply(200, sharedDocumentFolder);

				const response = await request.get(`${baseUrl}/1/supporting-documents/manage-documents/1`);
				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).not.toContain('Manage and share');
				expect(unprettifiedElement.innerHTML).toContain(
					'Manage <span class="govuk-visually-hidden">'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'<strong class="govuk-tag govuk-tag--blue govuk-!-margin-right-1">Shared</strong>'
				);
			});
		});

		describe('GET /supporting-documents/manage-documents/:folderId/:documentId', () => {
			beforeEach(() => {
				usersService.getUsersByRole = jest.fn().mockResolvedValue(activeDirectoryUsersData);
				usersService.getUserByRoleAndId = jest.fn().mockResolvedValue(activeDirectoryUsersData[0]);
				usersService.getUserById = jest.fn().mockResolvedValue(activeDirectoryUsersData[0]);
			});

			it(`should render a 404 error page if the folderId is not valid`, async () => {
				nock('http://test/')
					.get('/appeals/documents/1/versions')
					.reply(200, documentFileVersionsInfo);

				const response = await request.get(
					`${baseUrl}/1/supporting-documents/manage-documents/99/1`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Page not found');
			});

			it(`should render a 404 error page if the documentId is not valid`, async () => {
				nock('http://test/')
					.get('/appeals/documents/1/versions')
					.reply(200, documentFileVersionsInfo);

				const response = await request.get(
					`${baseUrl}/1/supporting-documents/manage-documents/${supportingDocsFolderId}/99`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Page not found');
			});

			it(`should render the manage individual document page with the expected content if the folderId and documentId are both valid and the document virus check status is null`, async () => {
				nock('http://test/')
					.get('/appeals/documents/1/versions')
					.reply(200, documentFileVersionsInfo);

				const response = await request.get(
					`${baseUrl}/1/supporting-documents/manage-documents/${supportingDocsFolderId}/1`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Document details</h1>');
				expect(unprettifiedElement.innerHTML).toContain('test-pdf-documentFileVersionsInfo.pdf');
				expect(unprettifiedElement.innerHTML).toContain(
					'<strong class="govuk-tag govuk-tag--yellow">Virus scanning</strong>'
				);
				expect(unprettifiedElement.innerHTML).not.toContain('Upload a new version');
				expect(unprettifiedElement.innerHTML).not.toContain('Remove current version');
			});

			it(`should render the manage individual document page with the expected content if the folderId and documentId are both valid and the document virus check status is "not_scanned"`, async () => {
				nock('http://test/')
					.get('/appeals/documents/1/versions')
					.reply(200, documentFileVersionsInfoNotChecked);

				const response = await request.get(
					`${baseUrl}/1/supporting-documents/manage-documents/${supportingDocsFolderId}/1`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Document details</h1>');
				expect(unprettifiedElement.innerHTML).toContain('test-pdf-documentFileVersionsInfo.pdf');
				expect(unprettifiedElement.innerHTML).toContain(
					'<strong class="govuk-tag govuk-tag--yellow">Virus scanning</strong>'
				);
				expect(unprettifiedElement.innerHTML).not.toContain('Upload a new version');
				expect(unprettifiedElement.innerHTML).not.toContain('Remove current version');
			});

			it(`should render the manage individual document page with the expected content if the folderId and documentId are both valid and the document virus check status is "affected"`, async () => {
				nock('http://test/')
					.get('/appeals/documents/1/versions')
					.reply(200, documentFileVersionsInfoVirusFound);

				const response = await request.get(
					`${baseUrl}/1/supporting-documents/manage-documents/${supportingDocsFolderId}/1`
				);

				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Document details</h1>');
				expect(unprettifiedElement.innerHTML).toContain('test-pdf-documentFileVersionsInfo.pdf');
				expect(unprettifiedElement.innerHTML).toContain(
					'<strong class="govuk-tag govuk-tag--red">Virus detected</strong>'
				);
				expect(unprettifiedElement.innerHTML).toContain('Upload a new version');
				expect(unprettifiedElement.innerHTML).toContain('Remove current version');

				const errorSummaryElement = parseHtml(response.text, {
					rootElement: '.govuk-error-summary'
				});

				expect(errorSummaryElement.innerHTML).toContain(
					'The selected file contains a virus. Upload a different version.'
				);
			});

			it(`should render the manage individual document page with the expected content if the folderId and documentId are both valid and the document virus check status is "scanned"`, async () => {
				nock('http://test/')
					.get('/appeals/documents/1/versions')
					.reply(200, documentFileVersionsInfoChecked);

				const response = await request.get(
					`${baseUrl}/1/supporting-documents/manage-documents/${supportingDocsFolderId}/1`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Document details</h1>');
				expect(unprettifiedElement.innerHTML).toContain('test-pdf-documentFileVersionsInfo.pdf');
				expect(unprettifiedElement.innerHTML).not.toContain(
					'<strong class="govuk-tag govuk-tag--yellow">Virus scanning</strong>'
				);
				expect(unprettifiedElement.innerHTML).not.toContain(
					'<strong class="govuk-tag govuk-tag--red">Virus detected</strong>'
				);
				expect(unprettifiedElement.innerHTML).toContain('Upload a new version');
				expect(unprettifiedElement.innerHTML).toContain('Remove current version');
			});

			it(`should render 'Shared' tags under the Version Summary and in Version History if document IS shared`, async () => {
				nock.cleanAll();
				nock('http://test/').get('/appeals/1/exists').reply(200, appealData).persist();
				nock('http://test/')
					.get('/appeals/document-redaction-statuses')
					.reply(200, documentRedactionStatuses)
					.persist();
				nock('http://test/')
					.get(getFolderApiUrl(supportingDocsFolderId))
					.reply(200, supportingDocumentsFolderInfo);
				nock('http://test/').get('/appeals/documents/1').reply(200, documentFileInfo);

				const sharedDocumentVersionsInfo = structuredClone(documentFileVersionsInfoChecked);
				sharedDocumentVersionsInfo.latestDocumentVersion.published = true;
				sharedDocumentVersionsInfo.allVersions.forEach((version) => {
					version.published = true;
				});

				nock('http://test/')
					.get('/appeals/documents/1/versions')
					.reply(200, sharedDocumentVersionsInfo);

				const response = await request.get(
					`${baseUrl}/1/supporting-documents/manage-documents/${supportingDocsFolderId}/1`
				);

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain(
					'<br><strong class="govuk-tag govuk-tag--blue govuk-!-margin-top-1">Shared</strong>'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'<strong class="govuk-tag govuk-tag--blue govuk-!-margin-right-1">Shared</strong><a class="govuk-link"'
				);
			});

			it(`should render 'Document details' and 'Share document' button with correct link if document is NOT shared`, async () => {
				nock.cleanAll();
				nock('http://test/').get('/appeals/1/exists').reply(200, appealData).persist();
				nock('http://test/')
					.get('/appeals/document-redaction-statuses')
					.reply(200, documentRedactionStatuses)
					.persist();

				nock('http://test/')
					.get(getFolderApiUrl(supportingDocsFolderId))
					.reply(200, supportingDocumentsFolderInfo);

				nock('http://test/').get('/appeals/documents/1').reply(200, documentFileInfo);

				const unsharedDocumentVersionsInfo = structuredClone(documentFileVersionsInfoChecked);
				unsharedDocumentVersionsInfo.latestDocumentVersion.published = false;

				nock('http://test/')
					.get('/appeals/documents/1/versions')
					.reply(200, unsharedDocumentVersionsInfo);

				const response = await request.get(
					`${baseUrl}/1/supporting-documents/manage-documents/${supportingDocsFolderId}/1`
				);

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Document details</h1>');
				expect(unprettifiedElement.innerHTML).toContain('Current version</h2>');
				expect(unprettifiedElement.innerHTML).toContain('This document is not shared</p>');

				const expectedHref = `/appeals-service/appeal-details/1/supporting-documents/manage-documents/${supportingDocsFolderId}/1/invite-responses`;

				expect(unprettifiedElement.innerHTML).toContain(`href="${expectedHref}"`);
				expect(unprettifiedElement.innerHTML).toContain('Share document</a>');
			});
		});

		describe('GET /supporting-documents/manage-documents/:folderId/:documentId/:versionId/delete', () => {
			it(`should render the delete document page with the expected content when there is a single document version`, async () => {
				nock('http://test/')
					.get('/appeals/documents/1/versions')
					.reply(200, documentFileVersionsInfoChecked);

				const response = await request.get(
					`${baseUrl}/1/supporting-documents/manage-documents/${supportingDocsFolderId}/1/1/delete`
				);

				const element = parseHtml(response.text);
				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain(
					'Are you sure you want to remove this version?</h1>'
				);
				expect(unprettifiedElement.innerHTML).toContain('class="govuk-warning-text"');

				const warningTextElement = parseHtml(response.text, {
					rootElement: '.govuk-warning-text',
					skipPrettyPrint: true
				});

				expect(warningTextElement.innerHTML).toContain(
					'Removing the only version of a document will delete the document from the case'
				);

				const radiosElement = parseHtml(response.text, {
					rootElement: '.govuk-radios',
					skipPrettyPrint: true
				});

				expect(radiosElement.innerHTML).toContain(
					'name="delete-file-answer" type="radio" value="yes"'
				);
				expect(radiosElement.innerHTML).toContain(
					'name="delete-file-answer" type="radio" value="no"'
				);
			});

			it(`should render the delete document page with the expected content when there are multiple document versions`, async () => {
				const multipleVersionsDocument = structuredClone(documentFileVersionsInfoChecked);
				multipleVersionsDocument.allVersions.push(multipleVersionsDocument.allVersions[0]);

				nock('http://test/')
					.get('/appeals/documents/1/versions')
					.reply(200, multipleVersionsDocument);

				const response = await request.get(
					`${baseUrl}/1/supporting-documents/manage-documents/${supportingDocsFolderId}/1/1/delete`
				);

				const element = parseHtml(response.text);
				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain(
					'Are you sure you want to remove this version?</h1>'
				);
				expect(unprettifiedElement.innerHTML).not.toContain('class="govuk-warning-text"');

				const radiosElement = parseHtml(response.text, {
					rootElement: '.govuk-radios',
					skipPrettyPrint: true
				});

				expect(radiosElement.innerHTML).toContain(
					'name="delete-file-answer" type="radio" value="yes"'
				);
				expect(radiosElement.innerHTML).toContain(
					'name="delete-file-answer" type="radio" value="no"'
				);
			});
		});

		describe('POST /supporting-documents/manage-documents/:folderId/:documentId/:versionId/delete', () => {
			beforeEach(() => {
				nock('http://test/').delete('/appeals/documents/1/1').reply(200, {
					guid: '15d19184-155b-4b6c-bba6-2bd2a61ca9a3',
					name: 'test-pdf-documentFileVersionsInfo.pdf',
					folderId: 1,
					createdAt: '2024-04-09T13:10:07.517Z',
					isDeleted: true,
					latestVersionId: null,
					caseId: 1,
					latestDocumentVersion: null
				});
			});

			it(`should re-render the delete document page with the expected error message if answer was not provided`, async () => {
				nock('http://test/')
					.get('/appeals/documents/1/versions')
					.reply(200, documentFileVersionsInfo);

				const response = await request
					.post(
						`${baseUrl}/1/supporting-documents/manage-documents/${supportingDocsFolderId}/1/1/delete`
					)
					.send({});
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain(
					'Are you sure you want to remove this version?</h1>'
				);
				expect(unprettifiedElement.innerHTML).toContain('class="govuk-error-summary"');

				const errorSummaryElement = parseHtml(response.text, {
					rootElement: '.govuk-error-summary'
				});

				expect(errorSummaryElement.innerHTML).toContain(
					'Select yes if you are sure you want to remove this version'
				);
			});

			it(`should not send an API request to delete the document, and should redirect to the manage document page, if answer "no" was provided`, async () => {
				nock('http://test/')
					.get('/appeals/documents/1/versions')
					.reply(200, documentFileVersionsInfo);

				const response = await request
					.post(
						`${baseUrl}/1/supporting-documents/manage-documents/${supportingDocsFolderId}/1/1/delete`
					)
					.send({
						'delete-file-answer': 'no'
					});

				expect(response.statusCode).toBe(302);
				expect(response.text).toContain('Found. Redirecting to ');
				expect(response.text).toContain(
					`/appeals-service/appeal-details/1/supporting-documents/manage-documents/${supportingDocsFolderId}/1`
				);
			});

			it(`should send an API request to delete the document, and redirect to the case details page, if answer "yes" was provided`, async () => {
				nock('http://test/')
					.get('/appeals/documents/1/versions')
					.reply(200, documentFileVersionsInfo);

				const response = await request
					.post(
						`${baseUrl}/1/supporting-documents/manage-documents/${supportingDocsFolderId}/1/1/delete`
					)
					.send({
						'delete-file-answer': 'yes'
					});

				expect(response.statusCode).toBe(302);
				expect(response.text).toContain('Found. Redirecting to ');
				expect(response.text).toContain('/appeals-service/appeal-details/1');
			});
		});

		describe('GET /supporting-documents/change-document-name/:folderId/:documentId', () => {
			beforeEach(() => {
				nock('http://test/')
					.get('/appeals/documents/1/versions')
					.reply(200, documentFileVersionsInfoChecked);
			});
			it('should render the change document name page with the expected content', async () => {
				const response = await request.get(
					`${baseUrl}/1/supporting-documents/change-document-name/1/1`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Change document details</span><h1');
				expect(unprettifiedElement.innerHTML).toContain('File name');
				expect(unprettifiedElement.innerHTML).toContain('value="ph0-documentFileInfo">');
			});
		});

		describe('POST /supporting-documents/change-document-name/:folderId/:documentId', () => {
			beforeEach(() => {
				nock('http://test/').get('/appeals/document-redaction-statuses').reply(200, []);
				nock('http://test/').patch('/appeals/1/documents/1').reply(200, {});
				nock('http://test/')
					.get('/appeals/documents/1/versions')
					.reply(200, documentFileVersionsInfoChecked);
			});

			it('should redirect to manage documents page after change document name success', async () => {
				const fullUrl = `/appeals-service/appeal-details/1/supporting-documents/change-document-name/1/1`;
				const response = await request
					.post(`${baseUrl}/1/supporting-documents/change-document-name/1/1`)
					.send({ fileName: 'new-name', documentId: '1' });

				expect(response.statusCode).toBe(302);
				expect(response.text).toContain(
					`Found. Redirecting to ${fullUrl.replace('change-document-name', 'manage-documents')}`
				);
			});
		});
	});

	describe('GET and POST /supporting-documents/manage-documents/:folderId/:documentId/invite-responses', () => {
		beforeEach(() => {
			nock.cleanAll();
			nock('http://test/').get('/appeals/1/exists').reply(200, appealData).persist();
			nock('http://test/')
				.get(getFolderApiUrl(supportingDocsFolderId))
				.reply(200, supportingDocumentsFolderInfo)
				.persist();
		});

		it(`should render the invite responses page`, async () => {
			const response = await request.get(
				`${baseUrl}/1/supporting-documents/manage-documents/${supportingDocsFolderId}/1/invite-responses`
			);

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(response.statusCode).toBe(200);
			expect(unprettifiedElement.innerHTML).toContain('Do you want to invite responses?</h1>');
			expect(unprettifiedElement.innerHTML).toContain(
				'name="invite-responses" type="radio" value="yes"'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="invite-responses" type="radio" value="no"'
			);
			expect(unprettifiedElement.innerHTML).toContain('Confirm and share document</button>');
		});

		it(`should render the invite responses page with pre-selected option`, async () => {
			await request
				.post(
					`${baseUrl}/1/supporting-documents/manage-documents/${supportingDocsFolderId}/1/invite-responses`
				)
				.send({ 'invite-responses': 'yes' });
			const response = await request.get(
				`${baseUrl}/1/supporting-documents/manage-documents/${supportingDocsFolderId}/1/invite-responses`
			);

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'name="invite-responses" type="radio" value="yes" checked'
			);
		});

		it(`should return a validation error if no option is selected on POST`, async () => {
			const response = await request
				.post(
					`${baseUrl}/1/supporting-documents/manage-documents/${supportingDocsFolderId}/1/invite-responses`
				)
				.send({});

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(response.statusCode).toBe(200);
			expect(unprettifiedElement.innerHTML).toContain('Select yes if you want to invite responses');
		});

		it(`should redirect to check-your-answers if an option is selected on POST`, async () => {
			const response = await request
				.post(
					`${baseUrl}/1/supporting-documents/manage-documents/${supportingDocsFolderId}/1/invite-responses`
				)
				.send({ 'invite-responses': 'yes' });

			expect(response.statusCode).toBe(302);
			expect(response.text).toContain(
				`Found. Redirecting to /appeals-service/appeal-details/1/supporting-documents/manage-documents/${supportingDocsFolderId}/1/check-your-answers`
			);
		});
	});

	describe('GET and POST /supporting-documents/manage-documents/:folderId/:documentId/check-your-answers', () => {
		describe(`Testing Share CYA for supporting documents`, () => {
			beforeEach(() => {
				// const templateName = 'shared-supporting-document.content.md';

				nock.cleanAll();
				nock('http://test/').get('/appeals/1/exists').reply(200, appealData).persist();
				nock('http://test/')
					.get(getFolderApiUrl(supportingDocsFolderId))
					.reply(200, supportingDocumentsFolderInfo)
					.persist();
				nock('http://test/')
					.get('/appeals/documents/1/versions')
					.reply(200, documentFileVersionsInfoChecked)
					.persist();
				nock('http://test/')
					.get('/appeals/1/case-team-email')
					.reply(200, { email: 'test@example.com' })
					.persist();
				// nock('http://test/')
				// 	.post(`/appeals/notify-preview/${templateName}`)
				// 	.reply(200, { renderedHtml: '<p>Test notification</p>' })
				// 	.persist();
			});

			it(`should render the check your answers page`, async () => {
				const response = await request.get(
					`${baseUrl}/1/supporting-documents/manage-documents/${supportingDocsFolderId}/1/check-your-answers`
				);

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(response.statusCode).toBe(200);
				expect(unprettifiedElement.innerHTML).toContain(
					'Confirm you want to share test-pdf-documentFileVersionsInfo.pdf with the main parties</h1>'
				);
				expect(unprettifiedElement.innerHTML).toContain('Confirm and share document</button>');
			});

			it(`should route the backlink properly depending on the document type`, async () => {
				const response = await request.get(
					`${baseUrl}/1/supporting-documents/manage-documents/${supportingDocsFolderId}/1/check-your-answers`
				);

				const backLinkElement = parseHtml(response.text, {
					rootElement: '.govuk-back-link',
					skipPrettyPrint: true
				});

				const expectedHref = `/appeals-service/appeal-details/1/supporting-documents/manage-documents/${supportingDocsFolderId}/1/invite-responses`;

				expect(backLinkElement.innerHTML).toContain(`href="${expectedHref}"`);
			});

			it(`should redirect to the case details page on successful share`, async () => {
				const mockPatchEndpoint = nock('http://test/')
					.patch('/appeals/1/documents/1', (body) => {
						return body.document && body.document.isShared === true;
					})
					.reply(200);

				const response = await request
					.post(
						`${baseUrl}/1/supporting-documents/manage-documents/${supportingDocsFolderId}/1/check-your-answers`
					)
					.send({});

				expect(response.statusCode).toBe(302);
				expect(response.text).toContain(`Found. Redirecting to /appeals-service/appeal-details/1`);
				expect(mockPatchEndpoint.isDone()).toBe(true);
			});
		});
	});
});
