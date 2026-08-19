// @ts-nocheck
import usersService from '#appeals/appeal-users/users-service.js';
import { dateISOStringToDisplayDate } from '#lib/dates.js';
import {
	activeDirectoryUsersData,
	documentFileInfo,
	documentFileVersionsInfo,
	documentRedactionStatuses,
	fileUploadInfo,
	inquiryEventDocumentsFolderInfo
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

const inquiryEventDocsFolderId = inquiryEventDocumentsFolderInfo.folderId;

describe('inquiry event documents', () => {
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
			.reply(200, inquiryEventDocumentsFolderInfo)
			.persist();
		nock('http://test/').get('/appeals/documents/1').reply(200, documentFileInfo);
		nock('http://test/').post('/appeals/validate-business-date').reply(200, true).persist();
	});
	afterEach(teardown);

	describe('inquiry event documents', () => {
		describe('GET /inquiry-event-documents/upload-documents/:folderId', () => {
			it(`should render the upload documents page`, async () => {
				const response = await request.get(
					`${baseUrl}/1/inquiry-event-documents/upload-documents/${inquiryEventDocsFolderId}`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain(`Upload inquiry event document</h1>`);
				expect(unprettifiedElement.innerHTML).toContain(
					'<div class="govuk-grid-row pins-file-upload"'
				);
				expect(unprettifiedElement.innerHTML).toContain('Choose files</button>');
			});
		});

		describe('POST /inquiry-event-documents/upload-documents/:folderId', () => {
			it(`should render a 500 error page if upload-info is not present in the request body`, async () => {
				const response = await request
					.post(`${baseUrl}/1/inquiry-event-documents/upload-documents/${inquiryEventDocsFolderId}`)
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
					.post(`${baseUrl}/1/inquiry-event-documents/upload-documents/${inquiryEventDocsFolderId}`)
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
					.post(`${baseUrl}/1/inquiry-event-documents/upload-documents/${inquiryEventDocsFolderId}`)
					.send({
						'upload-info': fileUploadInfo
					});

				expect(response.statusCode).toBe(302);
				expect(response.text).toBe(
					`Found. Redirecting to /appeals-service/appeal-details/1/inquiry-event-documents/add-document-details/${inquiryEventDocsFolderId}`
				);
			});
		});

		describe('GET /inquiry-event-documents/upload-documents/:folderId/:documentId', () => {
			beforeEach(() => {
				nock('http://test/')
					.get('/appeals/documents/1/versions')
					.reply(200, documentFileVersionsInfo);
			});

			it(`should render the upload document version page for document`, async () => {
				const response = await request.get(
					`${baseUrl}/1/inquiry-event-documents/upload-documents/${inquiryEventDocsFolderId}/1`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();
				expect(element.innerHTML).toContain(`Inquiry event documents</h1>`);
				expect(element.innerHTML).toContain('<div class="govuk-grid-row pins-file-upload"');
				expect(element.innerHTML).toContain('Choose file</button>');
			});
		});

		describe('POST /inquiry-event-documents/upload-documents/:folderId/:documentId', () => {
			it(`should render a 500 error page if upload-info is not present in the request body`, async () => {
				const response = await request
					.post(
						`${baseUrl}/1/inquiry-event-documents/upload-documents/${inquiryEventDocsFolderId}/1`
					)
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
					.post(
						`${baseUrl}/1/inquiry-event-documents/upload-documents/${inquiryEventDocsFolderId}/1`
					)
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
					.post(
						`${baseUrl}/1/inquiry-event-documents/upload-documents/${inquiryEventDocsFolderId}/1`
					)
					.send({
						'upload-info': fileUploadInfo
					});

				expect(response.statusCode).toBe(302);
				expect(response.text).toBe(
					`Found. Redirecting to /appeals-service/appeal-details/1/inquiry-event-documents/add-document-details/${inquiryEventDocsFolderId}/1`
				);
			});
		});

		describe('GET /inquiry-event-documents/add-document-details/:folderId', () => {
			it(`should render a 500 error page if fileUploadInfo is not present in the session`, async () => {
				const response = await request.get(
					`${baseUrl}/1/inquiry-event-documents/add-document-details/${inquiryEventDocsFolderId}`
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
					.post(`${baseUrl}/1/inquiry-event-documents/upload-documents/${inquiryEventDocsFolderId}`)
					.send({
						'upload-info': fileUploadInfo
					});

				expect(addDocumentsResponse.statusCode).toBe(302);

				const response = await request.get(
					`${baseUrl}/1/inquiry-event-documents/add-document-details/${inquiryEventDocsFolderId}`
				);

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
				expect(unprettifiedElement.innerHTML).toContain(`Inquiry event document</h1>`);
				expect(unprettifiedElement.innerHTML).toContain('test-document.txt</h2>');
				expect(unprettifiedElement.innerHTML).toContain('Date received</legend>');
				expect(unprettifiedElement.innerHTML).toContain('Redaction status</legend>');
			});

			it(`should render a back link to the upload document page`, async () => {
				const addDocumentsResponse = await request
					.post(`${baseUrl}/1/inquiry-event-documents/upload-documents/${inquiryEventDocsFolderId}`)
					.send({
						'upload-info': fileUploadInfo
					});

				expect(addDocumentsResponse.statusCode).toBe(302);

				const response = await request.get(
					`${baseUrl}/1/inquiry-event-documents/add-document-details/${inquiryEventDocsFolderId}`
				);
				const element = parseHtml(response.text, {
					rootElement: '.govuk-back-link',
					skipPrettyPrint: true
				});

				expect(element.innerHTML).toContain(
					`href="/appeals-service/appeal-details/1/inquiry-event-documents/upload-documents/${inquiryEventDocsFolderId}"`
				);
			});
		});

		describe('POST /inquiry-event-documents/add-document-details/:folderId', () => {
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
					.post(`${baseUrl}/1/inquiry-event-documents/upload-documents/${inquiryEventDocsFolderId}`)
					.send({
						'upload-info': fileUploadInfo
					});
			});

			let expectedH1Text = `Inquiry event document`;

			it(`should re-render the document details page with the expected error message if the request body is in an incorrect format`, async () => {
				expect(addDocumentsResponse.statusCode).toBe(302);

				const response = await request
					.post(
						`${baseUrl}/1/inquiry-event-documents/add-document-details/${inquiryEventDocsFolderId}`
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
						expectedError: `Inquiry event document date must include a day`
					},
					{
						value: 'a',
						expectedError: `Inquiry event document date day must be a number`
					},
					{
						value: '0',
						expectedError: `Inquiry event document date day must be between 1 and 31`
					},
					{
						value: '32',
						expectedError: `Inquiry event document date day must be between 1 and 31`
					}
				];

				for (const testCase of testCases) {
					const response = await request
						.post(
							`${baseUrl}/1/inquiry-event-documents/add-document-details/${inquiryEventDocsFolderId}`
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
						expectedError: `Inquiry event document date must include a month`
					},
					{
						value: 'a',
						expectedError: `Inquiry event document date must be a real date`
					},
					{
						value: '0',
						expectedError: `Inquiry event document date month must be between 1 and 12`
					},
					{
						value: '13',
						expectedError: `Inquiry event document date month must be between 1 and 12`
					}
				];

				for (const testCase of testCases) {
					const response = await request
						.post(
							`${baseUrl}/1/inquiry-event-documents/add-document-details/${inquiryEventDocsFolderId}`
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
						expectedError: `Inquiry event document date must include a year`
					},
					{
						value: 'a',
						expectedError: `Inquiry event document date year must be a number`
					},
					{
						value: '202',
						expectedError: `Inquiry event document date year must be 4 digits`
					}
				];

				for (const testCase of testCases) {
					const response = await request
						.post(
							`${baseUrl}/1/inquiry-event-documents/add-document-details/${inquiryEventDocsFolderId}`
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
						`${baseUrl}/1/inquiry-event-documents/add-document-details/${inquiryEventDocsFolderId}`
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
					`Inquiry event document date must be a real date`
				);
			});

			it(`should send a patch request to the appeal documents endpoint and redirect to the check and confirm page, if complete and valid document details were provided`, async () => {
				expect(addDocumentsResponse.statusCode).toBe(302);

				const response = await request
					.post(
						`${baseUrl}/1/inquiry-event-documents/add-document-details/${inquiryEventDocsFolderId}`
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
								redactionStatus: 3
							}
						]
					});

				expect(response.statusCode).toBe(302);
				expect(response.text).toEqual(
					`Found. Redirecting to /appeals-service/appeal-details/1/inquiry-event-documents/check-your-answers/${inquiryEventDocsFolderId}`
				);
			});
		});

		describe('GET /inquiry-event-documents/add-document-details/:folderId/:documentId', () => {
			it(`should render a 500 error page if fileUploadInfo is not present in the session`, async () => {
				const response = await request.get(
					`${baseUrl}/1/inquiry-event-documents/add-document-details/${inquiryEventDocsFolderId}/1`
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
					.post(
						`${baseUrl}/1/inquiry-event-documents/upload-documents/${inquiryEventDocsFolderId}/1`
					)
					.send({
						'upload-info': fileUploadInfo
					});

				expect(addDocumentsResponse.statusCode).toBe(302);
				expect(addDocumentsResponse.text).toContain(
					`Found. Redirecting to /appeals-service/appeal-details/1/inquiry-event-documents/add-document-details/${inquiryEventDocsFolderId}/1`
				);

				const response = await request.get(
					`${baseUrl}/1/inquiry-event-documents/add-document-details/${inquiryEventDocsFolderId}/1`
				);

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
				expect(unprettifiedElement.innerHTML).toContain(`Inquiry event document</h1>`);
				expect(unprettifiedElement.innerHTML).toContain('test-document.txt</h2>');
				expect(unprettifiedElement.innerHTML).toContain('Date received</legend>');
				expect(unprettifiedElement.innerHTML).toContain('Redaction status</legend>');
			});

			it(`should render a back link to the upload document version page`, async () => {
				const addDocumentsResponse = await request
					.post(
						`${baseUrl}/1/inquiry-event-documents/upload-documents/${inquiryEventDocsFolderId}/1`
					)
					.send({
						'upload-info': fileUploadInfo
					});

				expect(addDocumentsResponse.statusCode).toBe(302);
				expect(addDocumentsResponse.text).toContain(
					`Found. Redirecting to /appeals-service/appeal-details/1/inquiry-event-documents/add-document-details/${inquiryEventDocsFolderId}/1`
				);

				const response = await request.get(
					`${baseUrl}/1/inquiry-event-documents/add-document-details/${inquiryEventDocsFolderId}/1`
				);
				const element = parseHtml(response.text, {
					rootElement: '.govuk-back-link',
					skipPrettyPrint: true
				});

				expect(element.innerHTML).toContain(
					`href="/appeals-service/appeal-details/1/inquiry-event-documents/upload-documents/${inquiryEventDocsFolderId}/1"`
				);
			});
		});

		describe('POST /inquiry-event-documents/add-document-details/:folderId/:documentId', () => {
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
					.post(
						`${baseUrl}/1/inquiry-event-documents/upload-documents/${inquiryEventDocsFolderId}/1`
					)
					.send({
						'upload-info': fileUploadInfo
					});
			});

			let expectedH1Text = `Inquiry event document`;

			it(`should re-render the document details page with the expected error message if the request body is in an incorrect format`, async () => {
				expect(addDocumentsResponse.statusCode).toBe(302);

				const response = await request
					.post(
						`${baseUrl}/1/inquiry-event-documents/add-document-details/${inquiryEventDocsFolderId}/1`
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
						expectedError: `Inquiry event document date must include a day`
					},
					{
						value: 'a',
						expectedError: `Inquiry event document date day must be a number`
					},
					{
						value: '0',
						expectedError: `Inquiry event document date day must be between 1 and 31`
					},
					{
						value: '32',
						expectedError: `Inquiry event document date day must be between 1 and 31`
					}
				];

				for (const testCase of testCases) {
					const response = await request
						.post(
							`${baseUrl}/1/inquiry-event-documents/add-document-details/${inquiryEventDocsFolderId}/1`
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
						expectedError: `Inquiry event document date must include a month`
					},
					{
						value: 'a',
						expectedError: `Inquiry event document date must be a real date`
					},
					{
						value: '0',
						expectedError: `Inquiry event document date month must be between 1 and 12`
					},
					{
						value: '13',
						expectedError: `Inquiry event document date month must be between 1 and 12`
					}
				];

				for (const testCase of testCases) {
					const response = await request
						.post(
							`${baseUrl}/1/inquiry-event-documents/add-document-details/${inquiryEventDocsFolderId}/1`
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
						expectedError: `Inquiry event document date must include a year`
					},
					{
						value: 'a',
						expectedError: `Inquiry event document date year must be a number`
					},
					{
						value: '202',
						expectedError: `Inquiry event document date year must be 4 digits`
					}
				];

				for (const testCase of testCases) {
					const response = await request
						.post(
							`${baseUrl}/1/inquiry-event-documents/add-document-details/${inquiryEventDocsFolderId}/1`
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
						`${baseUrl}/1/inquiry-event-documents/add-document-details/${inquiryEventDocsFolderId}/1`
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
					`Inquiry event document date must be a real date`
				);
			});

			it(`should send a patch request to the appeal documents endpoint and redirect to the check and confirm page, if complete and valid document details were provided`, async () => {
				expect(addDocumentsResponse.statusCode).toBe(302);

				const response = await request
					.post(
						`${baseUrl}/1/inquiry-event-documents/add-document-details/${inquiryEventDocsFolderId}/1`
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
					`Found. Redirecting to /appeals-service/appeal-details/1/inquiry-event-documents/check-your-answers/${inquiryEventDocsFolderId}/1`
				);
			});
		});

		describe('GET /inquiry-event-documents/check-your-answers/:folderId', () => {
			it(`should render a 500 error page if fileUploadInfo is not present in the session`, async () => {
				const response = await request.get(
					`${baseUrl}/1/inquiry-event-documents/check-your-answers/${inquiryEventDocsFolderId}`
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
					.post(`${baseUrl}/1/inquiry-event-documents/upload-documents/${inquiryEventDocsFolderId}`)
					.send({
						'upload-info': fileUploadInfo
					});

				expect(addDocumentsResponse.statusCode).toBe(302);

				const response = await request.get(
					`${baseUrl}/1/inquiry-event-documents/check-your-answers/${inquiryEventDocsFolderId}`
				);

				expect(response.statusCode).toBe(200);

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Check your answers</h1>');
				expect(unprettifiedElement.innerHTML).toContain('File</dt>');
				expect(unprettifiedElement.innerHTML).toContain(
					'<a class="govuk-link" href="/documents/APP/Q9999/D/21/351062/download-uncommitted/1/test-document.txt" target="_blank">test-document.txt</a></dd>'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					`<a class="govuk-link" href="/appeals-service/appeal-details/1/inquiry-event-documents/upload-documents/${inquiryEventDocsFolderId}">Change<span class="govuk-visually-hidden"> file test-document.txt</span></a></dd>`
				);
				expect(unprettifiedElement.innerHTML).toContain('Date received</dt>');
				expect(unprettifiedElement.innerHTML).toContain(
					`${dateISOStringToDisplayDate(new Date().toISOString())}</dd>`
				);
				expect(unprettifiedElement.innerHTML).toContain('Redaction status</dt>');
				expect(unprettifiedElement.innerHTML).toContain('No redaction required</dd>');
				expect(unprettifiedElement.innerHTML).toContain(
					`<a class="govuk-link" href="/appeals-service/appeal-details/1/inquiry-event-documents/add-document-details/${inquiryEventDocsFolderId}">Change<span class="govuk-visually-hidden"> test-document.txt date received</span></a></dd>`
				);
				expect(unprettifiedElement.innerHTML).toContain(
					`<a class="govuk-link" href="/appeals-service/appeal-details/1/inquiry-event-documents/add-document-details/${inquiryEventDocsFolderId}">Change<span class="govuk-visually-hidden"> test-document.txt redaction status</span></a></dd>`
				);
				expect(unprettifiedElement.innerHTML).toContain('Confirm</button>');
			});
		});

		describe('POST /inquiry-event-documents/check-your-answers/:folderId', () => {
			it(`should render a 500 error page if fileUploadInfo is not present in the session`, async () => {
				const response = await request
					.post(
						`${baseUrl}/1/inquiry-event-documents/check-your-answers/${inquiryEventDocsFolderId}`
					)
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
					.post(`${baseUrl}/1/inquiry-event-documents/upload-documents/${inquiryEventDocsFolderId}`)
					.send({
						'upload-info': fileUploadInfo
					});

				expect(addDocumentsResponse.statusCode).toBe(302);

				const response = await request
					.post(
						`${baseUrl}/1/inquiry-event-documents/check-your-answers/${inquiryEventDocsFolderId}`
					)
					.send({});

				expect(response.statusCode).toBe(302);
				expect(response.text).toBe('Found. Redirecting to /appeals-service/appeal-details/1');
				expect(mockDocumentsEndpoint.isDone()).toBe(true);
			});
		});

		describe('GET /inquiry-event-documents/check-your-answers/:folderId/:documentId', () => {
			it(`should render a 500 error page if fileUploadInfo is not present in the session`, async () => {
				const response = await request.get(
					`${baseUrl}/1/inquiry-event-documents/check-your-answers/${inquiryEventDocsFolderId}/1`
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
					.post(
						`${baseUrl}/1/inquiry-event-documents/upload-documents/${inquiryEventDocsFolderId}/1`
					)
					.send({
						'upload-info': fileUploadInfo
					});

				expect(addDocumentsResponse.statusCode).toBe(302);

				const response = await request.get(
					`${baseUrl}/1/inquiry-event-documents/check-your-answers/${inquiryEventDocsFolderId}/1`
				);

				expect(response.statusCode).toBe(200);

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Check your answers</h1>');
				expect(unprettifiedElement.innerHTML).toContain('File</dt>');
				expect(unprettifiedElement.innerHTML).toContain(
					'<a class="govuk-link" href="/documents/APP/Q9999/D/21/351062/download-uncommitted/1/ph0-documentFileInfo.jpeg/2" target="_blank">test-document.txt</a></dd>'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					`<a class="govuk-link" href="/appeals-service/appeal-details/1/inquiry-event-documents/upload-documents/${inquiryEventDocsFolderId}/1">Change<span class="govuk-visually-hidden"> file test-document.txt</span></a></dd>`
				);
				expect(unprettifiedElement.innerHTML).toContain('Date received</dt>');
				expect(unprettifiedElement.innerHTML).toContain(
					`${dateISOStringToDisplayDate(new Date().toISOString())}</dd>`
				);
				expect(unprettifiedElement.innerHTML).toContain('Redaction status</dt>');
				expect(unprettifiedElement.innerHTML).toContain('No redaction required</dd>');
				expect(unprettifiedElement.innerHTML).toContain(
					`<a class="govuk-link" href="/appeals-service/appeal-details/1/inquiry-event-documents/add-document-details/${inquiryEventDocsFolderId}/1">Change<span class="govuk-visually-hidden"> test-document.txt date received</span></a></dd>`
				);
				expect(unprettifiedElement.innerHTML).toContain(
					`<a class="govuk-link" href="/appeals-service/appeal-details/1/inquiry-event-documents/add-document-details/${inquiryEventDocsFolderId}/1">Change<span class="govuk-visually-hidden"> test-document.txt redaction status</span></a></dd>`
				);
				expect(unprettifiedElement.innerHTML).toContain('Confirm</button>');
			});
		});

		describe('POST /inquiry-event-documents/check-your-answers/:folderId/:documentId', () => {
			it(`should render a 500 error page if fileUploadInfo is not present in the session`, async () => {
				const response = await request
					.post(
						`${baseUrl}/1/inquiry-event-documents/check-your-answers/${inquiryEventDocsFolderId}/1`
					)
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
					.post(
						`${baseUrl}/1/inquiry-event-documents/upload-documents/${inquiryEventDocsFolderId}/1`
					)
					.send({
						'upload-info': fileUploadInfo
					});

				expect(addDocumentsResponse.statusCode).toBe(302);

				const response = await request
					.post(
						`${baseUrl}/1/inquiry-event-documents/check-your-answers/${inquiryEventDocsFolderId}/1`
					)
					.send({});

				expect(response.statusCode).toBe(302);
				expect(response.text).toBe('Found. Redirecting to /appeals-service/appeal-details/1');
				expect(mockDocumentsEndpoint.isDone()).toBe(true);
			});
		});

		describe('GET /inquiry-event-documents/manage-documents/:folderId', () => {
			beforeEach(() => {
				usersService.getUserByRoleAndId = jest.fn().mockResolvedValue(activeDirectoryUsersData[0]);
			});

			it(`should render a 404 error page if the folderId is not valid`, async () => {
				const response = await request.get(
					`${baseUrl}/1/inquiry-event-documents/manage-documents/99`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();
				expect(element.innerHTML).toContain('Page not found</h1>');
			});

			it(`should render the manage folder page with one document item for each document present in the folder if the folderId is valid`, async () => {
				const response = await request.get(
					`${baseUrl}/1/inquiry-event-documents/manage-documents/${inquiryEventDocsFolderId}`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Manage folder</span><h1');
				expect(unprettifiedElement.innerHTML).toContain(`Inquiry event documents</h1>`);
				expect(unprettifiedElement.innerHTML).toContain(
					`<a href="/appeals-service/appeal-details/1/inquiry-event-documents/upload-documents/${inquiryEventDocsFolderId}" role="button" draggable="false" class="govuk-button govuk-button--secondary" data-module="govuk-button"> Add document</a>`
				);
			});
		});
	});
});
