// @ts-nocheck
import usersService from '#appeals/appeal-users/users-service.js';
import { dateISOStringToDisplayDate } from '#lib/dates.js';
import {
	activeDirectoryUsersData,
	appealData,
	costsFolderInfoAppellantApplication,
	costsFolderInfoAppellantCorrespondence,
	costsFolderInfoAppellantWithdrawal,
	costsFolderInfoDecision,
	costsFolderInfoLpaApplication,
	costsFolderInfoLpaCorrespondence,
	costsFolderInfoLpaWithdrawal,
	documentFileInfo,
	documentFileVersionsInfo,
	documentFileVersionsInfoChecked,
	documentFileVersionsInfoNotChecked,
	documentFileVersionsInfoVirusFound,
	documentRedactionStatuses,
	fileUploadInfo
} from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { jest } from '@jest/globals';
import { parseHtml } from '@pins/platform';
import { capitalize, upperCase } from 'lodash-es';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';
const costsCategoriesNotIncludingDecision = ['appellant', 'lpa'];
const costsDocumentTypes = ['application', 'withdrawal', 'correspondence'];

describe('costs', () => {
	beforeAll(() => {
		jest.clearAllMocks();
	});

	beforeEach(() => {
		installMockApi();
		nock('http://test/').get('/appeals/1?include=all').reply(200, appealData);
		nock('http://test/')
			.get('/appeals/document-redaction-statuses')
			.reply(200, documentRedactionStatuses)
			.persist();
		nock('http://test/')
			.get('/appeals/1/document-folders/1')
			.reply(200, costsFolderInfoAppellantApplication)
			.persist();
		nock('http://test/')
			.get('/appeals/1/document-folders/2')
			.reply(200, costsFolderInfoAppellantWithdrawal)
			.persist();
		nock('http://test/')
			.get('/appeals/1/document-folders/3')
			.reply(200, costsFolderInfoAppellantCorrespondence)
			.persist();
		nock('http://test/')
			.get('/appeals/1/document-folders/4')
			.reply(200, costsFolderInfoLpaApplication)
			.persist();
		nock('http://test/')
			.get('/appeals/1/document-folders/5')
			.reply(200, costsFolderInfoLpaWithdrawal)
			.persist();
		nock('http://test/')
			.get('/appeals/1/document-folders/6')
			.reply(200, costsFolderInfoLpaCorrespondence)
			.persist();
		nock('http://test/')
			.get('/appeals/1/document-folders/7')
			.reply(200, costsFolderInfoDecision)
			.persist();
		nock('http://test/').get('/appeals/1/documents/1').reply(200, documentFileInfo);
		nock('http://test/').post('/appeals/validate-business-date').reply(200, true).persist();
	});
	afterEach(teardown);

	describe('application, withdrawal and correspondence', () => {
		describe('GET /costs/:costsCategory/:costsDocumentType/upload-documents/:folderId', () => {
			for (const costsCategory of costsCategoriesNotIncludingDecision) {
				for (const costsDocumentType of costsDocumentTypes) {
					const costsFolder =
						appealData.costs[`${costsCategory}${capitalize(costsDocumentType)}Folder`];

					it(`should render the upload documents page (${costsCategory} ${costsDocumentType})`, async () => {
						const response = await request.get(
							`${baseUrl}/1/costs/${costsCategory}/${costsDocumentType}/upload-documents/${costsFolder.folderId}`
						);
						const element = parseHtml(response.text);

						expect(element.innerHTML).toMatchSnapshot();

						const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

						expect(unprettifiedElement.innerHTML).toContain(
							`Upload ${
								costsCategory === 'appellant' ? costsCategory : 'LPA'
							} costs ${costsDocumentType} document</h1>`
						);
						expect(unprettifiedElement.innerHTML).toContain(
							'<div class="govuk-grid-row pins-file-upload"'
						);
						expect(unprettifiedElement.innerHTML).toContain('Choose files</button>');
					});
				}
			}
		});

		describe('POST /costs/:costsCategory/:costsDocumentType/upload-documents/:folderId', () => {
			for (const costsCategory of costsCategoriesNotIncludingDecision) {
				for (const costsDocumentType of costsDocumentTypes) {
					const costsFolder =
						appealData.costs[`${costsCategory}${capitalize(costsDocumentType)}Folder`];

					it(`should render a 500 error page if upload-info is not present in the request body (${costsCategory} ${costsDocumentType})`, async () => {
						const response = await request
							.post(
								`${baseUrl}/1/costs/${costsCategory}/${costsDocumentType}/upload-documents/${costsFolder.folderId}`
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

					it(`should render a 500 error page if request body upload-info is in an incorrect format (${costsCategory})`, async () => {
						const response = await request
							.post(
								`${baseUrl}/1/costs/${costsCategory}/${costsDocumentType}/upload-documents/${costsFolder.folderId}`
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

					it(`should redirect to the add document details page if upload-info is present in the request body and in the correct format (${costsCategory})`, async () => {
						const response = await request
							.post(
								`${baseUrl}/1/costs/${costsCategory}/${costsDocumentType}/upload-documents/${costsFolder.folderId}`
							)
							.send({
								'upload-info': fileUploadInfo
							});

						expect(response.statusCode).toBe(302);
						expect(response.text).toBe(
							`Found. Redirecting to /appeals-service/appeal-details/1/costs/${costsCategory}/${costsDocumentType}/add-document-details/${costsFolder.folderId}`
						);
					});
				}
			}
		});

		describe('GET /costs/:costsCategory/:costsDocumentType/upload-documents/:folderId/:documentId', () => {
			beforeEach(() => {
				nock('http://test/')
					.get('/appeals/1/documents/1/versions')
					.reply(200, documentFileVersionsInfo);
			});

			for (const costsCategory of costsCategoriesNotIncludingDecision) {
				for (const costsDocumentType of costsDocumentTypes) {
					const costsFolder =
						appealData.costs[`${costsCategory}${capitalize(costsDocumentType)}Folder`];

					it(`should render the upload document version page (${costsCategory} ${costsDocumentType})`, async () => {
						const response = await request.get(
							`${baseUrl}/1/costs/${costsCategory}/${costsDocumentType}/upload-documents/${costsFolder.folderId}/1`
						);
						const element = parseHtml(response.text);

						expect(element.innerHTML).toMatchSnapshot();
						expect(element.innerHTML).toContain(
							`${costsCategory === 'lpa' ? 'LPA' : 'Appellant'} ${costsDocumentType}</h1>`
						);
						expect(element.innerHTML).toContain('<div class="govuk-grid-row pins-file-upload"');
						expect(element.innerHTML).toContain('Choose file</button>');
					});
				}
			}
		});

		describe('POST /costs/:costsCategory/:costsDocumentType/upload-documents/:folderId/:documentId', () => {
			for (const costsCategory of costsCategoriesNotIncludingDecision) {
				for (const costsDocumentType of costsDocumentTypes) {
					const costsFolder =
						appealData.costs[`${costsCategory}${capitalize(costsDocumentType)}Folder`];

					it(`should render a 500 error page if upload-info is not present in the request body (${costsCategory} ${costsDocumentType})`, async () => {
						const response = await request
							.post(
								`${baseUrl}/1/costs/${costsCategory}/${costsDocumentType}/upload-documents/${costsFolder.folderId}/1`
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

					it(`should render a 500 error page if request body upload-info is in an incorrect format (${costsCategory})`, async () => {
						const response = await request
							.post(
								`${baseUrl}/1/costs/${costsCategory}/${costsDocumentType}/upload-documents/${costsFolder.folderId}/1`
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

					it(`should redirect to the add document details page if upload-info is present in the request body and in the correct format (${costsCategory})`, async () => {
						const response = await request
							.post(
								`${baseUrl}/1/costs/${costsCategory}/${costsDocumentType}/upload-documents/${costsFolder.folderId}/1`
							)
							.send({
								'upload-info': fileUploadInfo
							});

						expect(response.statusCode).toBe(302);
						expect(response.text).toBe(
							`Found. Redirecting to /appeals-service/appeal-details/1/costs/${costsCategory}/${costsDocumentType}/add-document-details/${costsFolder.folderId}/1`
						);
					});
				}
			}
		});

		describe('GET /costs/:costsCategory/:costsDocumentType/add-document-details/:folderId', () => {
			for (const costsCategory of costsCategoriesNotIncludingDecision) {
				for (const costsDocumentType of costsDocumentTypes) {
					const costsFolder =
						appealData.costs[`${costsCategory}${capitalize(costsDocumentType)}Folder`];

					it(`should render a 500 error page if fileUploadInfo is not present in the session (${costsCategory} ${costsDocumentType})`, async () => {
						const response = await request.get(
							`${baseUrl}/1/costs/${costsCategory}/${costsDocumentType}/add-document-details/${costsFolder.folderId}`
						);

						expect(response.statusCode).toBe(500);
						const element = parseHtml(response.text);
						expect(element.innerHTML).toMatchSnapshot();

						const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

						expect(unprettifiedElement.innerHTML).toContain(
							'Sorry, there is a problem with the service</h1>'
						);
					});

					it(`should render the document details page with one item per uploaded document (${costsCategory} ${costsDocumentType})`, async () => {
						const addDocumentsResponse = await request
							.post(
								`${baseUrl}/1/costs/${costsCategory}/${costsDocumentType}/upload-documents/${costsFolder.folderId}`
							)
							.send({
								'upload-info': fileUploadInfo
							});

						expect(addDocumentsResponse.statusCode).toBe(302);

						const response = await request.get(
							`${baseUrl}/1/costs/${costsCategory}/${costsDocumentType}/add-document-details/${costsFolder.folderId}`
						);

						const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

						expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
						expect(unprettifiedElement.innerHTML).toContain(
							`${
								costsCategory === 'appellant' ? 'Appellant' : 'LPA'
							} costs ${costsDocumentType} document</h1>`
						);
						expect(unprettifiedElement.innerHTML).toContain('test-document.txt</h2>');
						expect(unprettifiedElement.innerHTML).toContain('Date received</legend>');
						expect(unprettifiedElement.innerHTML).toContain('Redaction status</legend>');
					});

					it(`should render a back link to the upload document page (${costsCategory} ${costsDocumentType})`, async () => {
						const addDocumentsResponse = await request
							.post(
								`${baseUrl}/1/costs/${costsCategory}/${costsDocumentType}/upload-documents/${costsFolder.folderId}`
							)
							.send({
								'upload-info': fileUploadInfo
							});

						expect(addDocumentsResponse.statusCode).toBe(302);

						const response = await request.get(
							`${baseUrl}/1/costs/${costsCategory}/${costsDocumentType}/add-document-details/${costsFolder.folderId}`
						);
						const element = parseHtml(response.text, {
							rootElement: '.govuk-back-link',
							skipPrettyPrint: true
						});

						expect(element.innerHTML).toContain(
							`href="/appeals-service/appeal-details/1/costs/${costsCategory}/${costsDocumentType}/upload-documents/${costsFolder.folderId}"`
						);
					});
				}
			}
		});

		describe('POST /costs/:costsCategory/:costsDocumentType/add-document-details/:folderId', () => {
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

				for (const costsCategory of costsCategoriesNotIncludingDecision) {
					for (const costsDocumentType of costsDocumentTypes) {
						const costsFolder =
							appealData.costs[`${costsCategory}${capitalize(costsDocumentType)}Folder`];

						addDocumentsResponse = await request
							.post(
								`${baseUrl}/1/costs/${costsCategory}/${costsDocumentType}/upload-documents/${costsFolder.folderId}`
							)
							.send({
								'upload-info': fileUploadInfo
							});
					}
				}
			});

			for (const costsCategory of costsCategoriesNotIncludingDecision) {
				for (const costsDocumentType of costsDocumentTypes) {
					const costsFolder =
						appealData.costs[`${costsCategory}${capitalize(costsDocumentType)}Folder`];

					let expectedH1Text = `${
						costsCategory === 'appellant' ? 'Appellant' : 'LPA'
					} costs ${costsDocumentType} document`;

					it(`should re-render the document details page with the expected error message if the request body is in an incorrect format (${costsCategory} ${costsDocumentType})`, async () => {
						expect(addDocumentsResponse.statusCode).toBe(302);

						const response = await request
							.post(
								`${baseUrl}/1/costs/${costsCategory}/${costsDocumentType}/add-document-details/${costsFolder.folderId}`
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

					it(`should re-render the document details page with the expected error message if receivedDate day is an invalid value (${costsCategory} ${costsDocumentType})`, async () => {
						expect(addDocumentsResponse.statusCode).toBe(302);

						const testCases = [
							{
								value: '',
								expectedError: `${
									costsCategory === 'lpa' ? upperCase(costsCategory) : capitalize(costsCategory)
								} costs ${costsDocumentType} date must include a day`
							},
							{
								value: 'a',
								expectedError: `${
									costsCategory === 'lpa' ? upperCase(costsCategory) : capitalize(costsCategory)
								} costs ${costsDocumentType} date day must be a number`
							},
							{
								value: '0',
								expectedError: `${
									costsCategory === 'lpa' ? upperCase(costsCategory) : capitalize(costsCategory)
								} costs ${costsDocumentType} date day must be between 1 and 31`
							},
							{
								value: '32',
								expectedError: `${
									costsCategory === 'lpa' ? upperCase(costsCategory) : capitalize(costsCategory)
								} costs ${costsDocumentType} date day must be between 1 and 31`
							}
						];

						for (const testCase of testCases) {
							const response = await request
								.post(
									`${baseUrl}/1/costs/${costsCategory}/${costsDocumentType}/add-document-details/${costsFolder.folderId}`
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

					it(`should re-render the document details page with the expected error message if receivedDate month is an invalid value (${costsCategory} ${costsDocumentType})`, async () => {
						expect(addDocumentsResponse.statusCode).toBe(302);

						const testCases = [
							{
								value: '',
								expectedError: `${
									costsCategory === 'lpa' ? upperCase(costsCategory) : capitalize(costsCategory)
								} costs ${costsDocumentType} date must include a month`
							},
							{
								value: 'a',
								expectedError: `${
									costsCategory === 'lpa' ? upperCase(costsCategory) : capitalize(costsCategory)
								} costs ${costsDocumentType} date must be a real date`
							},
							{
								value: '0',
								expectedError: `${
									costsCategory === 'lpa' ? upperCase(costsCategory) : capitalize(costsCategory)
								} costs ${costsDocumentType} date month must be between 1 and 12`
							},
							{
								value: '13',
								expectedError: `${
									costsCategory === 'lpa' ? upperCase(costsCategory) : capitalize(costsCategory)
								} costs ${costsDocumentType} date month must be between 1 and 12`
							}
						];

						for (const testCase of testCases) {
							const response = await request
								.post(
									`${baseUrl}/1/costs/${costsCategory}/${costsDocumentType}/add-document-details/${costsFolder.folderId}`
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

					it(`should re-render the document details page with the expected error message if receivedDate year is an invalid value (${costsCategory} ${costsDocumentType})`, async () => {
						expect(addDocumentsResponse.statusCode).toBe(302);

						const testCases = [
							{
								value: '',
								expectedError: `${
									costsCategory === 'lpa' ? upperCase(costsCategory) : capitalize(costsCategory)
								} costs ${costsDocumentType} date must include a year`
							},
							{
								value: 'a',
								expectedError: `${
									costsCategory === 'lpa' ? upperCase(costsCategory) : capitalize(costsCategory)
								} costs ${costsDocumentType} date year must be a number`
							},
							{
								value: '202',
								expectedError: `${
									costsCategory === 'lpa' ? upperCase(costsCategory) : capitalize(costsCategory)
								} costs ${costsDocumentType} date year must be 4 digits`
							}
						];

						for (const testCase of testCases) {
							const response = await request
								.post(
									`${baseUrl}/1/costs/${costsCategory}/${costsDocumentType}/add-document-details/${costsFolder.folderId}`
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

					it(`should re-render the document details page with the expected error message if receivedDate is not a valid date (${costsCategory} ${costsDocumentType})`, async () => {
						expect(addDocumentsResponse.statusCode).toBe(302);

						const response = await request
							.post(
								`${baseUrl}/1/costs/${costsCategory}/${costsDocumentType}/add-document-details/${costsFolder.folderId}`
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
							`${
								costsCategory === 'lpa' ? upperCase(costsCategory) : capitalize(costsCategory)
							} costs ${costsDocumentType} date must be a real date`
						);
					});

					it(`should re-render the document details page with the expected error message if receivedDate is not a valid date (${costsCategory} ${costsDocumentType})`, async () => {
						expect(addDocumentsResponse.statusCode).toBe(302);

						const response = await request
							.post(
								`${baseUrl}/1/costs/${costsCategory}/${costsDocumentType}/add-document-details/${costsFolder.folderId}`
							)
							.send({
								items: [
									{
										documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
										receivedDate: {
											day: '',
											month: '',
											year: ''
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
							`Enter the date you received the ${
								costsCategory === 'lpa' ? upperCase(costsCategory) : costsCategory
							} costs ${costsDocumentType}`
						);
					});

					it(`should re-render the document details page with the expected error message if receivedDate is not a valid date (${costsCategory} ${costsDocumentType})`, async () => {
						expect(addDocumentsResponse.statusCode).toBe(302);

						const response = await request
							.post(
								`${baseUrl}/1/costs/${costsCategory}/${costsDocumentType}/add-document-details/${costsFolder.folderId}`
							)
							.send({
								items: [
									{
										documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
										receivedDate: {
											day: '2',
											month: '',
											year: ''
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
							`${
								costsCategory === 'lpa' ? upperCase(costsCategory) : capitalize(costsCategory)
							} costs ${costsDocumentType} date must include a month and year`
						);
					});

					it(`should re-render the document details page with the expected error message if receivedDate is not a valid date (${costsCategory} ${costsDocumentType})`, async () => {
						expect(addDocumentsResponse.statusCode).toBe(302);

						const response = await request
							.post(
								`${baseUrl}/1/costs/${costsCategory}/${costsDocumentType}/add-document-details/${costsFolder.folderId}`
							)
							.send({
								items: [
									{
										documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
										receivedDate: {
											day: '',
											month: '2',
											year: ''
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
							`${
								costsCategory === 'lpa' ? upperCase(costsCategory) : capitalize(costsCategory)
							} costs ${costsDocumentType} date must include a day and year`
						);
					});

					it(`should re-render the document details page with the expected error message if receivedDate is not a valid date (${costsCategory} ${costsDocumentType})`, async () => {
						expect(addDocumentsResponse.statusCode).toBe(302);

						const response = await request
							.post(
								`${baseUrl}/1/costs/${costsCategory}/${costsDocumentType}/add-document-details/${costsFolder.folderId}`
							)
							.send({
								items: [
									{
										documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
										receivedDate: {
											day: '',
											month: '',
											year: '2025'
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
							`${
								costsCategory === 'lpa' ? upperCase(costsCategory) : capitalize(costsCategory)
							} costs ${costsDocumentType} date must include a day and month`
						);
					});

					it(`should send a patch request to the appeal documents endpoint and redirect to the check and confirm page, if complete and valid document details were provided (${costsCategory} ${costsDocumentType})`, async () => {
						expect(addDocumentsResponse.statusCode).toBe(302);

						const response = await request
							.post(
								`${baseUrl}/1/costs/${costsCategory}/${costsDocumentType}/add-document-details/${costsFolder.folderId}`
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
							`Found. Redirecting to /appeals-service/appeal-details/1/costs/${costsCategory}/${costsDocumentType}/check-your-answers/${costsFolder.folderId}`
						);
					});
				}
			}
		});

		describe('GET /costs/:costsCategory/:costsDocumentType/add-document-details/:folderId/:documentId', () => {
			for (const costsCategory of costsCategoriesNotIncludingDecision) {
				for (const costsDocumentType of costsDocumentTypes) {
					const costsFolder =
						appealData.costs[`${costsCategory}${capitalize(costsDocumentType)}Folder`];

					it(`should render a 500 error page if fileUploadInfo is not present in the session (${costsCategory})`, async () => {
						const response = await request.get(
							`${baseUrl}/1/costs/${costsCategory}/${costsDocumentType}/add-document-details/${costsFolder.folderId}/1`
						);

						expect(response.statusCode).toBe(500);
						const element = parseHtml(response.text);
						expect(element.innerHTML).toMatchSnapshot();

						const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

						expect(unprettifiedElement.innerHTML).toContain(
							'Sorry, there is a problem with the service</h1>'
						);
					});

					it(`should render the document details page with one item per uploaded document (${costsCategory} ${costsDocumentType})`, async () => {
						const addDocumentsResponse = await request
							.post(
								`${baseUrl}/1/costs/${costsCategory}/${costsDocumentType}/upload-documents/${costsFolder.folderId}/1`
							)
							.send({
								'upload-info': fileUploadInfo
							});

						expect(addDocumentsResponse.statusCode).toBe(302);
						expect(addDocumentsResponse.text).toContain(
							`Found. Redirecting to /appeals-service/appeal-details/1/costs/${costsCategory}/${costsDocumentType}/add-document-details/${costsFolder.folderId}/1`
						);

						const response = await request.get(
							`${baseUrl}/1/costs/${costsCategory}/${costsDocumentType}/add-document-details/${costsFolder.folderId}/1`
						);

						const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

						expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
						expect(unprettifiedElement.innerHTML).toContain(
							`${
								costsCategory === 'appellant' ? 'Appellant' : 'LPA'
							} costs ${costsDocumentType} document</h1>`
						);
						expect(unprettifiedElement.innerHTML).toContain('test-document.txt</h2>');
						expect(unprettifiedElement.innerHTML).toContain('Date received</legend>');
						expect(unprettifiedElement.innerHTML).toContain('Redaction status</legend>');
					});

					it(`should render a back link to the upload document version page (${costsCategory} ${costsDocumentType})`, async () => {
						const addDocumentsResponse = await request
							.post(
								`${baseUrl}/1/costs/${costsCategory}/${costsDocumentType}/upload-documents/${costsFolder.folderId}/1`
							)
							.send({
								'upload-info': fileUploadInfo
							});

						expect(addDocumentsResponse.statusCode).toBe(302);
						expect(addDocumentsResponse.text).toContain(
							`Found. Redirecting to /appeals-service/appeal-details/1/costs/${costsCategory}/${costsDocumentType}/add-document-details/${costsFolder.folderId}/1`
						);

						const response = await request.get(
							`${baseUrl}/1/costs/${costsCategory}/${costsDocumentType}/add-document-details/${costsFolder.folderId}/1`
						);
						const element = parseHtml(response.text, {
							rootElement: '.govuk-back-link',
							skipPrettyPrint: true
						});

						expect(element.innerHTML).toContain(
							`href="/appeals-service/appeal-details/1/costs/${costsCategory}/${costsDocumentType}/upload-documents/${costsFolder.folderId}/1"`
						);
					});
				}
			}
		});

		describe('POST /costs/:costsCategory/:costsDocumentType/add-document-details/:folderId/:documentId', () => {
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

				for (const costsCategory of costsCategoriesNotIncludingDecision) {
					for (const costsDocumentType of costsDocumentTypes) {
						const folder =
							appealData.costs[`${costsCategory}${capitalize(costsDocumentType)}Folder`];

						addDocumentsResponse = await request
							.post(
								`${baseUrl}/1/costs/${costsCategory}/${costsDocumentType}/upload-documents/${folder.folderId}/1`
							)
							.send({
								'upload-info': fileUploadInfo
							});
					}
				}
			});

			for (const costsCategory of costsCategoriesNotIncludingDecision) {
				for (const costsDocumentType of costsDocumentTypes) {
					const costsFolder =
						appealData.costs[`${costsCategory}${capitalize(costsDocumentType)}Folder`];

					let expectedH1Text = `${
						costsCategory === 'appellant' ? 'Appellant' : 'LPA'
					} costs ${costsDocumentType} document`;

					it(`should re-render the document details page with the expected error message if the request body is in an incorrect format (${costsCategory} ${costsDocumentType})`, async () => {
						expect(addDocumentsResponse.statusCode).toBe(302);

						const response = await request
							.post(
								`${baseUrl}/1/costs/${costsCategory}/${costsDocumentType}/add-document-details/${costsFolder.folderId}/1`
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

					it(`should re-render the document details page with the expected error message if receivedDate day is an invalid value (${costsCategory} ${costsDocumentType})`, async () => {
						expect(addDocumentsResponse.statusCode).toBe(302);

						const testCases = [
							{
								value: '',
								expectedError: `${
									costsCategory === 'lpa' ? upperCase(costsCategory) : capitalize(costsCategory)
								} costs ${costsDocumentType} date must include a day`
							},
							{
								value: 'a',
								expectedError: `${
									costsCategory === 'lpa' ? upperCase(costsCategory) : capitalize(costsCategory)
								} costs ${costsDocumentType} date day must be a number`
							},
							{
								value: '0',
								expectedError: `${
									costsCategory === 'lpa' ? upperCase(costsCategory) : capitalize(costsCategory)
								} costs ${costsDocumentType} date day must be between 1 and 31`
							},
							{
								value: '32',
								expectedError: `${
									costsCategory === 'lpa' ? upperCase(costsCategory) : capitalize(costsCategory)
								} costs ${costsDocumentType} date day must be between 1 and 31`
							}
						];

						for (const testCase of testCases) {
							const response = await request
								.post(
									`${baseUrl}/1/costs/${costsCategory}/${costsDocumentType}/add-document-details/${costsFolder.folderId}/1`
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

					it(`should re-render the document details page with the expected error message if receivedDate month is an invalid value (${costsCategory} ${costsDocumentType})`, async () => {
						expect(addDocumentsResponse.statusCode).toBe(302);

						const testCases = [
							{
								value: '',
								expectedError: `${
									costsCategory === 'lpa' ? upperCase(costsCategory) : capitalize(costsCategory)
								} costs ${costsDocumentType} date must include a month`
							},
							{
								value: 'a',
								expectedError: `${
									costsCategory === 'lpa' ? upperCase(costsCategory) : capitalize(costsCategory)
								} costs ${costsDocumentType} date must be a real date`
							},
							{
								value: '0',
								expectedError: `${
									costsCategory === 'lpa' ? upperCase(costsCategory) : capitalize(costsCategory)
								} costs ${costsDocumentType} date month must be between 1 and 12`
							},
							{
								value: '13',
								expectedError: `${
									costsCategory === 'lpa' ? upperCase(costsCategory) : capitalize(costsCategory)
								} costs ${costsDocumentType} date month must be between 1 and 12`
							}
						];

						for (const testCase of testCases) {
							const response = await request
								.post(
									`${baseUrl}/1/costs/${costsCategory}/${costsDocumentType}/add-document-details/${costsFolder.folderId}/1`
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

					it(`should re-render the document details page with the expected error message if receivedDate year is an invalid value (${costsCategory} ${costsDocumentType})`, async () => {
						expect(addDocumentsResponse.statusCode).toBe(302);

						const testCases = [
							{
								value: '',
								expectedError: `${
									costsCategory === 'lpa' ? upperCase(costsCategory) : capitalize(costsCategory)
								} costs ${costsDocumentType} date must include a year`
							},
							{
								value: 'a',
								expectedError: `${
									costsCategory === 'lpa' ? upperCase(costsCategory) : capitalize(costsCategory)
								} costs ${costsDocumentType} date year must be a number`
							},
							{
								value: '202',
								expectedError: `${
									costsCategory === 'lpa' ? upperCase(costsCategory) : capitalize(costsCategory)
								} costs ${costsDocumentType} date year must be 4 digits`
							}
						];

						for (const testCase of testCases) {
							const response = await request
								.post(
									`${baseUrl}/1/costs/${costsCategory}/${costsDocumentType}/add-document-details/${costsFolder.folderId}/1`
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

					it(`should re-render the document details page with the expected error message if receivedDate is not a valid date (${costsCategory} ${costsDocumentType})`, async () => {
						expect(addDocumentsResponse.statusCode).toBe(302);

						const response = await request
							.post(
								`${baseUrl}/1/costs/${costsCategory}/${costsDocumentType}/add-document-details/${costsFolder.folderId}/1`
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
							`${
								costsCategory === 'lpa' ? upperCase(costsCategory) : capitalize(costsCategory)
							} costs ${costsDocumentType} date must be a real date`
						);
					});

					it(`should send a patch request to the appeal documents endpoint and redirect to the check and confirm page, if complete and valid document details were provided (${costsCategory} ${costsDocumentType})`, async () => {
						expect(addDocumentsResponse.statusCode).toBe(302);

						const response = await request
							.post(
								`${baseUrl}/1/costs/${costsCategory}/${costsDocumentType}/add-document-details/${costsFolder.folderId}/1`
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
							`Found. Redirecting to /appeals-service/appeal-details/1/costs/${costsCategory}/${costsDocumentType}/check-your-answers/${costsFolder.folderId}/1`
						);
					});
				}
			}
		});

		describe('GET /costs/:costsCategory/:costsDocumentType/check-your-answers/:folderId', () => {
			for (const costsCategory of costsCategoriesNotIncludingDecision) {
				for (const costsDocumentType of costsDocumentTypes) {
					const costsFolder =
						appealData.costs[`${costsCategory}${capitalize(costsDocumentType)}Folder`];

					it(`should render a 500 error page if fileUploadInfo is not present in the session (${costsCategory} ${costsDocumentType})`, async () => {
						const response = await request.get(
							`${baseUrl}/1/costs/${costsCategory}/${costsDocumentType}/check-your-answers/${costsFolder.folderId}`
						);

						expect(response.statusCode).toBe(500);
						const element = parseHtml(response.text);
						expect(element.innerHTML).toMatchSnapshot();

						const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

						expect(unprettifiedElement.innerHTML).toContain(
							'Sorry, there is a problem with the service</h1>'
						);
					});

					it(`should render the add documents check and confirm page with summary list displaying info on the uploaded document and relevant change links (${costsCategory} ${costsDocumentType})`, async () => {
						const addDocumentsResponse = await request
							.post(
								`${baseUrl}/1/costs/${costsCategory}/${costsDocumentType}/upload-documents/${costsFolder.folderId}`
							)
							.send({
								'upload-info': fileUploadInfo
							});

						expect(addDocumentsResponse.statusCode).toBe(302);

						const response = await request.get(
							`${baseUrl}/1/costs/${costsCategory}/${costsDocumentType}/check-your-answers/${costsFolder.folderId}`
						);

						expect(response.statusCode).toBe(200);

						const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

						expect(unprettifiedElement.innerHTML).toContain('Check your answers</h1>');
						expect(unprettifiedElement.innerHTML).toContain('File</dt>');
						expect(unprettifiedElement.innerHTML).toContain(
							'<a class="govuk-link" href="/documents/APP/Q9999/D/21/351062/download-uncommitted/1/test-document.txt" target="_blank">test-document.txt</a></dd>'
						);
						expect(unprettifiedElement.innerHTML).toContain(
							`<a class="govuk-link" href="/appeals-service/appeal-details/1/costs/${costsCategory}/${costsDocumentType}/upload-documents/${costsFolder.folderId}">Change<span class="govuk-visually-hidden"> file test-document.txt</span></a></dd>`
						);
						expect(unprettifiedElement.innerHTML).toContain('Date received</dt>');
						expect(unprettifiedElement.innerHTML).toContain(
							`${dateISOStringToDisplayDate(new Date().toISOString())}</dd>`
						);
						expect(unprettifiedElement.innerHTML).toContain('Redaction status</dt>');
						expect(unprettifiedElement.innerHTML).toContain('No redaction required</dd>');
						expect(unprettifiedElement.innerHTML).toContain(
							`<a class="govuk-link" href="/appeals-service/appeal-details/1/costs/${costsCategory}/${costsDocumentType}/add-document-details/${costsFolder.folderId}">Change<span class="govuk-visually-hidden"> test-document.txt date received</span></a></dd>`
						);
						expect(unprettifiedElement.innerHTML).toContain(
							`<a class="govuk-link" href="/appeals-service/appeal-details/1/costs/${costsCategory}/${costsDocumentType}/add-document-details/${costsFolder.folderId}">Change<span class="govuk-visually-hidden"> test-document.txt redaction status</span></a></dd>`
						);
						expect(unprettifiedElement.innerHTML).toContain('Confirm</button>');
					});
				}
			}
		});

		describe('POST /costs/:costsCategory/:costsDocumentType/check-your-answers/:folderId', () => {
			for (const costsCategory of costsCategoriesNotIncludingDecision) {
				for (const costsDocumentType of costsDocumentTypes) {
					const costsFolder =
						appealData.costs[`${costsCategory}${capitalize(costsDocumentType)}Folder`];

					it(`should render a 500 error page if fileUploadInfo is not present in the session (${costsCategory} ${costsDocumentType})`, async () => {
						const response = await request
							.post(
								`${baseUrl}/1/costs/${costsCategory}/${costsDocumentType}/check-your-answers/${costsFolder.folderId}`
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

					it(`should send an API request to create a new document and redirect to the appeal details page (${costsCategory} ${costsDocumentType})`, async () => {
						const mockDocumentsEndpoint = nock('http://test/')
							.post('/appeals/1/documents')
							.reply(200);
						const addDocumentsResponse = await request
							.post(
								`${baseUrl}/1/costs/${costsCategory}/${costsDocumentType}/upload-documents/${costsFolder.folderId}`
							)
							.send({
								'upload-info': fileUploadInfo
							});

						expect(addDocumentsResponse.statusCode).toBe(302);

						const response = await request
							.post(
								`${baseUrl}/1/costs/${costsCategory}/${costsDocumentType}/check-your-answers/${costsFolder.folderId}`
							)
							.send({});

						expect(response.statusCode).toBe(302);
						expect(response.text).toBe('Found. Redirecting to /appeals-service/appeal-details/1');
						expect(mockDocumentsEndpoint.isDone()).toBe(true);
					});
				}
			}
		});

		describe('GET /costs/:costsCategory/:costsDocumentType/check-your-answers/:folderId/:documentId', () => {
			for (const costsCategory of costsCategoriesNotIncludingDecision) {
				for (const costsDocumentType of costsDocumentTypes) {
					const costsFolder =
						appealData.costs[`${costsCategory}${capitalize(costsDocumentType)}Folder`];

					it(`should render a 500 error page if fileUploadInfo is not present in the session (${costsCategory} ${costsDocumentType})`, async () => {
						const response = await request.get(
							`${baseUrl}/1/costs/${costsCategory}/${costsDocumentType}/check-your-answers/${costsFolder.folderId}/1`
						);

						expect(response.statusCode).toBe(500);
						const element = parseHtml(response.text);
						expect(element.innerHTML).toMatchSnapshot();

						const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

						expect(unprettifiedElement.innerHTML).toContain(
							'Sorry, there is a problem with the service</h1>'
						);
					});

					it(`should render the add documents check and confirm page with summary list row displaying info on the uploaded document (${costsCategory} ${costsDocumentType})`, async () => {
						const addDocumentsResponse = await request
							.post(
								`${baseUrl}/1/costs/${costsCategory}/${costsDocumentType}/upload-documents/${costsFolder.folderId}/1`
							)
							.send({
								'upload-info': fileUploadInfo
							});

						expect(addDocumentsResponse.statusCode).toBe(302);

						const response = await request.get(
							`${baseUrl}/1/costs/${costsCategory}/${costsDocumentType}/check-your-answers/${costsFolder.folderId}/1`
						);

						expect(response.statusCode).toBe(200);

						const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

						expect(unprettifiedElement.innerHTML).toContain('Check your answers</h1>');
						expect(unprettifiedElement.innerHTML).toContain('File</dt>');
						expect(unprettifiedElement.innerHTML).toContain(
							'<a class="govuk-link" href="/documents/APP/Q9999/D/21/351062/download-uncommitted/1/ph0-documentFileInfo.jpeg/2" target="_blank">test-document.txt</a></dd>'
						);
						expect(unprettifiedElement.innerHTML).toContain(
							`<a class="govuk-link" href="/appeals-service/appeal-details/1/costs/${costsCategory}/${costsDocumentType}/upload-documents/${costsFolder.folderId}/1">Change<span class="govuk-visually-hidden"> file test-document.txt</span></a></dd>`
						);
						expect(unprettifiedElement.innerHTML).toContain('Date received</dt>');
						expect(unprettifiedElement.innerHTML).toContain(
							`${dateISOStringToDisplayDate(new Date().toISOString())}</dd>`
						);
						expect(unprettifiedElement.innerHTML).toContain('Redaction status</dt>');
						expect(unprettifiedElement.innerHTML).toContain('No redaction required</dd>');
						expect(unprettifiedElement.innerHTML).toContain(
							`<a class="govuk-link" href="/appeals-service/appeal-details/1/costs/${costsCategory}/${costsDocumentType}/add-document-details/${costsFolder.folderId}/1">Change<span class="govuk-visually-hidden"> test-document.txt date received</span></a></dd>`
						);
						expect(unprettifiedElement.innerHTML).toContain(
							`<a class="govuk-link" href="/appeals-service/appeal-details/1/costs/${costsCategory}/${costsDocumentType}/add-document-details/${costsFolder.folderId}/1">Change<span class="govuk-visually-hidden"> test-document.txt redaction status</span></a></dd>`
						);
						expect(unprettifiedElement.innerHTML).toContain('Confirm</button>');
					});
				}
			}
		});

		describe('POST /costs/:costsCategory/:costsDocumentType/check-your-answers/:folderId/:documentId', () => {
			for (const costsCategory of costsCategoriesNotIncludingDecision) {
				for (const costsDocumentType of costsDocumentTypes) {
					const costsFolder =
						appealData.costs[`${costsCategory}${capitalize(costsDocumentType)}Folder`];

					it(`should render a 500 error page if fileUploadInfo is not present in the session (${costsCategory} ${costsDocumentType})`, async () => {
						const response = await request
							.post(
								`${baseUrl}/1/costs/${costsCategory}/${costsDocumentType}/check-your-answers/${costsFolder.folderId}/1`
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

					it(`should send an API request to create a new document and redirect to the appeal details page (${costsCategory} ${costsDocumentType})`, async () => {
						const mockDocumentsEndpoint = nock('http://test/')
							.post('/appeals/1/documents/1')
							.reply(200);
						const addDocumentsResponse = await request
							.post(
								`${baseUrl}/1/costs/${costsCategory}/${costsDocumentType}/upload-documents/${costsFolder.folderId}/1`
							)
							.send({
								'upload-info': fileUploadInfo
							});

						expect(addDocumentsResponse.statusCode).toBe(302);

						const response = await request
							.post(
								`${baseUrl}/1/costs/${costsCategory}/${costsDocumentType}/check-your-answers/${costsFolder.folderId}/1`
							)
							.send({});

						expect(response.statusCode).toBe(302);
						expect(response.text).toBe('Found. Redirecting to /appeals-service/appeal-details/1');
						expect(mockDocumentsEndpoint.isDone()).toBe(true);
					});
				}
			}
		});

		describe('GET /costs/:costsCategory/:costsDocumentType/manage-documents/:folderId', () => {
			beforeEach(() => {
				usersService.getUserByRoleAndId = jest.fn().mockResolvedValue(activeDirectoryUsersData[0]);
			});

			for (const costsCategory of costsCategoriesNotIncludingDecision) {
				for (const costsDocumentType of costsDocumentTypes) {
					const costsFolder =
						appealData.costs[`${costsCategory}${capitalize(costsDocumentType)}Folder`];

					it(`should render a 404 error page if the folderId is not valid (${costsCategory} ${costsDocumentType})`, async () => {
						const response = await request.get(
							`${baseUrl}/1/costs/${costsCategory}/${costsDocumentType}/manage-documents/99`
						);
						const element = parseHtml(response.text);

						expect(element.innerHTML).toMatchSnapshot();
						expect(element.innerHTML).toContain('Page not found</h1>');
					});

					it(`should render the manage folder page with one document item for each document present in the folder if the folderId is valid (${costsCategory} ${costsDocumentType})`, async () => {
						const response = await request.get(
							`${baseUrl}/1/costs/${costsCategory}/${costsDocumentType}/manage-documents/${costsFolder.folderId}`
						);
						const element = parseHtml(response.text);

						expect(element.innerHTML).toMatchSnapshot();

						const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

						expect(unprettifiedElement.innerHTML).toContain('Manage folder</span><h1');
						expect(unprettifiedElement.innerHTML).toContain(
							`${
								costsCategory === 'appellant' ? 'Appellant' : 'LPA'
							} costs ${costsDocumentType} documents</h1>`
						);
						expect(unprettifiedElement.innerHTML).toContain(
							`<a href="/appeals-service/appeal-details/1/costs/${costsCategory}/${costsDocumentType}/upload-documents/${costsFolder.folderId}" role="button" draggable="false" class="govuk-button govuk-button--secondary" data-module="govuk-button"> Add document</a>`
						);
					});
				}
			}
		});

		describe('GET /costs/:costsCategory/:costsDocumentType/manage-documents/:folderId/:documentId', () => {
			beforeEach(() => {
				usersService.getUsersByRole = jest.fn().mockResolvedValue(activeDirectoryUsersData);
				usersService.getUserByRoleAndId = jest.fn().mockResolvedValue(activeDirectoryUsersData[0]);
				usersService.getUserById = jest.fn().mockResolvedValue(activeDirectoryUsersData[0]);
			});

			for (const costsCategory of costsCategoriesNotIncludingDecision) {
				for (const costsDocumentType of costsDocumentTypes) {
					const costsFolder =
						appealData.costs[`${costsCategory}${capitalize(costsDocumentType)}Folder`];

					it(`should render a 404 error page if the folderId is not valid (${costsCategory} ${costsDocumentType})`, async () => {
						nock('http://test/')
							.get('/appeals/1/documents/1/versions')
							.reply(200, documentFileVersionsInfo);

						const response = await request.get(
							`${baseUrl}/1/costs/${costsCategory}/${costsDocumentType}/manage-documents/99/1`
						);
						const element = parseHtml(response.text);

						expect(element.innerHTML).toMatchSnapshot();

						const h1Element = parseHtml(response.text, { rootElement: 'main h1' });

						expect(h1Element.innerHTML).toContain('Page not found');
					});

					it(`should render a 404 error page if the documentId is not valid (${costsCategory} ${costsDocumentType})`, async () => {
						nock('http://test/')
							.get('/appeals/1/documents/1/versions')
							.reply(200, documentFileVersionsInfo);

						const response = await request.get(
							`${baseUrl}/1/costs/${costsCategory}/${costsDocumentType}/manage-documents/${costsFolder.folderId}/99`
						);
						const element = parseHtml(response.text);

						expect(element.innerHTML).toMatchSnapshot();

						const h1Element = parseHtml(response.text, { rootElement: 'main h1' });

						expect(h1Element.innerHTML).toContain('Page not found');
					});

					it(`should render the manage individual document page with the expected content if the folderId and documentId are both valid and the document virus check status is null (${costsCategory} ${costsDocumentType})`, async () => {
						nock('http://test/')
							.get('/appeals/1/documents/1/versions')
							.reply(200, documentFileVersionsInfo);

						const response = await request.get(
							`${baseUrl}/1/costs/${costsCategory}/${costsDocumentType}/manage-documents/${costsFolder.folderId}/1`
						);
						const element = parseHtml(response.text);

						expect(element.innerHTML).toMatchSnapshot();

						const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

						expect(unprettifiedElement.innerHTML).toContain(
							'test-pdf-documentFileVersionsInfo.pdf</h1>'
						);
						expect(unprettifiedElement.innerHTML).toContain(
							'<strong class="govuk-tag govuk-tag--yellow">Virus scanning</strong>'
						);
						expect(unprettifiedElement.innerHTML).not.toContain('Upload a new version');
						expect(unprettifiedElement.innerHTML).not.toContain('Remove current version');
					});

					it(`should render the manage individual document page with the expected content if the folderId and documentId are both valid and the document virus check status is "not_scanned" (${costsCategory} ${costsDocumentType})`, async () => {
						nock('http://test/')
							.get('/appeals/1/documents/1/versions')
							.reply(200, documentFileVersionsInfoNotChecked);

						const response = await request.get(
							`${baseUrl}/1/costs/${costsCategory}/${costsDocumentType}/manage-documents/${costsFolder.folderId}/1`
						);
						const element = parseHtml(response.text);

						expect(element.innerHTML).toMatchSnapshot();

						const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

						expect(unprettifiedElement.innerHTML).toContain(
							'test-pdf-documentFileVersionsInfo.pdf</h1>'
						);
						expect(unprettifiedElement.innerHTML).toContain(
							'<strong class="govuk-tag govuk-tag--yellow">Virus scanning</strong>'
						);
						expect(unprettifiedElement.innerHTML).not.toContain('Upload a new version');
						expect(unprettifiedElement.innerHTML).not.toContain('Remove current version');
					});

					it(`should render the manage individual document page with the expected content if the folderId and documentId are both valid and the document virus check status is "affected" (${costsCategory} ${costsDocumentType})`, async () => {
						nock('http://test/')
							.get('/appeals/1/documents/1/versions')
							.reply(200, documentFileVersionsInfoVirusFound);

						const response = await request.get(
							`${baseUrl}/1/costs/${costsCategory}/${costsDocumentType}/manage-documents/${costsFolder.folderId}/1`
						);

						const element = parseHtml(response.text);

						expect(element.innerHTML).toMatchSnapshot();

						const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

						expect(unprettifiedElement.innerHTML).toContain(
							'test-pdf-documentFileVersionsInfo.pdf</h1>'
						);
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

					it(`should render the manage individual document page with the expected content if the folderId and documentId are both valid and the document virus check status is "scanned" (${costsCategory} ${costsDocumentType})`, async () => {
						nock('http://test/')
							.get('/appeals/1/documents/1/versions')
							.reply(200, documentFileVersionsInfoChecked);

						const response = await request.get(
							`${baseUrl}/1/costs/${costsCategory}/${costsDocumentType}/manage-documents/${costsFolder.folderId}/1`
						);
						const element = parseHtml(response.text);

						expect(element.innerHTML).toMatchSnapshot();

						const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

						expect(unprettifiedElement.innerHTML).toContain(
							'test-pdf-documentFileVersionsInfo.pdf</h1>'
						);
						expect(unprettifiedElement.innerHTML).not.toContain(
							'<strong class="govuk-tag govuk-tag--yellow">Virus scanning</strong>'
						);
						expect(unprettifiedElement.innerHTML).not.toContain(
							'<strong class="govuk-tag govuk-tag--red">Virus detected</strong>'
						);
						expect(unprettifiedElement.innerHTML).toContain('Upload a new version');
						expect(unprettifiedElement.innerHTML).toContain('Remove current version');
					});
				}
			}
		});

		describe('GET /costs/:costsCategory/:costsDocumentType/manage-documents/:folderId/:documentId/:versionId/delete', () => {
			for (const costsCategory of costsCategoriesNotIncludingDecision) {
				for (const costsDocumentType of costsDocumentTypes) {
					const costsFolder =
						appealData.costs[`${costsCategory}${capitalize(costsDocumentType)}Folder`];

					it(`should render the delete document page with the expected content when there is a single document version (${costsCategory} ${costsDocumentType})`, async () => {
						nock('http://test/')
							.get('/appeals/1/documents/1/versions')
							.reply(200, documentFileVersionsInfoChecked);

						const response = await request.get(
							`${baseUrl}/1/costs/${costsCategory}/${costsDocumentType}/manage-documents/${costsFolder.folderId}/1/1/delete`
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

					it(`should render the delete document page with the expected content when there are multiple document versions (${costsCategory} ${costsDocumentType})`, async () => {
						const multipleVersionsDocument = structuredClone(documentFileVersionsInfoChecked);
						multipleVersionsDocument.allVersions.push(multipleVersionsDocument.allVersions[0]);

						nock('http://test/')
							.get('/appeals/1/documents/1/versions')
							.reply(200, multipleVersionsDocument);

						const response = await request.get(
							`${baseUrl}/1/costs/${costsCategory}/${costsDocumentType}/manage-documents/${costsFolder.folderId}/1/1/delete`
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
				}
			}
		});

		describe('POST /costs/:costsCategory/:costsDocumentType/manage-documents/:folderId/:documentId/:versionId/delete', () => {
			beforeEach(() => {
				nock('http://test/').delete('/appeals/1/documents/1/1').reply(200, {
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

			for (const costsCategory of costsCategoriesNotIncludingDecision) {
				for (const costsDocumentType of costsDocumentTypes) {
					const costsFolder =
						appealData.costs[`${costsCategory}${capitalize(costsDocumentType)}Folder`];

					it(`should re-render the delete document page with the expected error message if answer was not provided (${costsCategory} ${costsDocumentType})`, async () => {
						nock('http://test/')
							.get('/appeals/1/documents/1/versions')
							.reply(200, documentFileVersionsInfo);

						const response = await request
							.post(
								`${baseUrl}/1/costs/${costsCategory}/${costsDocumentType}/manage-documents/${costsFolder.folderId}/1/1/delete`
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

					it(`should not send an API request to delete the document, and should redirect to the manage document page, if answer "no" was provided (${costsCategory} ${costsDocumentType})`, async () => {
						nock('http://test/')
							.get('/appeals/1/documents/1/versions')
							.reply(200, documentFileVersionsInfo);

						const response = await request
							.post(
								`${baseUrl}/1/costs/${costsCategory}/${costsDocumentType}/manage-documents/${costsFolder.folderId}/1/1/delete`
							)
							.send({
								'delete-file-answer': 'no'
							});

						expect(response.statusCode).toBe(302);
						expect(response.text).toContain('Found. Redirecting to ');
						expect(response.text).toContain(
							`/appeals-service/appeal-details/1/costs/${costsCategory}/${costsDocumentType}/manage-documents/${costsFolder.folderId}/1`
						);
					});

					it(`should send an API request to delete the document, and redirect to the case details page, if answer "yes" was provided (${costsCategory} ${costsDocumentType})`, async () => {
						nock('http://test/')
							.get('/appeals/1/documents/1/versions')
							.reply(200, documentFileVersionsInfo);

						const response = await request
							.post(
								`${baseUrl}/1/costs/${costsCategory}/${costsDocumentType}/manage-documents/${costsFolder.folderId}/1/1/delete`
							)
							.send({
								'delete-file-answer': 'yes'
							});

						expect(response.statusCode).toBe(302);
						expect(response.text).toContain('Found. Redirecting to ');
						expect(response.text).toContain('/appeals-service/appeal-details/1');
					});
				}
			}
		});

		describe('GET /costs/:costsCategory/:costsDocumentType/change-document-name/:folderId/:documentId', () => {
			beforeEach(() => {
				nock('http://test/')
					.get('/appeals/1/documents/1/versions')
					.reply(200, documentFileVersionsInfoChecked);
			});
			for (const costsCategory of costsCategoriesNotIncludingDecision) {
				for (const costsDocumentType of costsDocumentTypes) {
					it('should render the change document name page with the expected content', async () => {
						const response = await request.get(
							`${baseUrl}/1/costs/${costsCategory}/${costsDocumentType}/change-document-name/1/1`
						);
						const element = parseHtml(response.text);

						expect(element.innerHTML).toMatchSnapshot();

						const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

						expect(unprettifiedElement.innerHTML).toContain('Change document details</span><h1');
						expect(unprettifiedElement.innerHTML).toContain('File name');
						expect(unprettifiedElement.innerHTML).toContain('value="ph0-documentFileInfo">');
					});
				}
			}
		});

		describe('POST /costs/:costsCategory/:costsDocumentType/change-document-name/:folderId/:documentId', () => {
			beforeEach(() => {
				nock('http://test/').get('/appeals/document-redaction-statuses').reply(200, []);
				nock('http://test/').patch('/appeals/1/documents/1').reply(200, {});
				nock('http://test/')
					.get('/appeals/1/documents/1/versions')
					.reply(200, documentFileVersionsInfoChecked);
			});

			for (const costsCategory of costsCategoriesNotIncludingDecision) {
				for (const costsDocumentType of costsDocumentTypes) {
					it('should redirect to manage documents page after change document name success', async () => {
						const fullUrl = `/appeals-service/appeal-details/1/costs/${costsCategory}/${costsDocumentType}/change-document-name/1/1`;
						const response = await request
							.post(
								`${baseUrl}/1/costs/${costsCategory}/${costsDocumentType}/change-document-name/1/1`
							)
							.send({ fileName: 'new-name', documentId: '1' });

						expect(response.statusCode).toBe(302);
						expect(response.text).toContain(
							`Found. Redirecting to ${fullUrl.replace('change-document-name', 'manage-documents')}`
						);
					});
				}
			}
		});
	});

	describe('decision', () => {
		describe('GET /costs/decision/upload-documents/:folderId', () => {
			it('should render the upload documents page', async () => {
				const response = await request.get(
					`${baseUrl}/1/costs/decision/upload-documents/${appealData.costs.decisionFolder?.folderId}`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Upload costs decision</h1>');
				expect(unprettifiedElement.innerHTML).toContain(
					'<div class="govuk-grid-row pins-file-upload"'
				);
				expect(unprettifiedElement.innerHTML).toContain('Choose files</button>');
			});
		});

		describe('POST /costs/decision/upload-documents/:folderId', () => {
			const costsFolder = appealData.costs.decisionFolder;

			it(`should render a 500 error page if upload-info is not present in the request body`, async () => {
				const response = await request
					.post(`${baseUrl}/1/costs/decision/upload-documents/${costsFolder.folderId}`)
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
					.post(`${baseUrl}/1/costs/decision/upload-documents/${costsFolder.folderId}`)
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
					.post(`${baseUrl}/1/costs/decision/upload-documents/${costsFolder.folderId}`)
					.send({
						'upload-info': fileUploadInfo
					});

				expect(response.statusCode).toBe(302);
				expect(response.text).toBe(
					`Found. Redirecting to /appeals-service/appeal-details/1/costs/decision/add-document-details/${costsFolder.folderId}`
				);
			});
		});

		describe('GET /costs/decision/upload-documents/:folderId/:documentId', () => {
			beforeEach(() => {
				nock('http://test/')
					.get('/appeals/1/documents/1/versions')
					.reply(200, documentFileVersionsInfo);
			});

			const costsFolder = appealData.costs.decisionFolder;

			it(`should render the upload document version page`, async () => {
				const response = await request.get(
					`${baseUrl}/1/costs/decision/upload-documents/${costsFolder.folderId}/1`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();
				expect(element.innerHTML).toContain('Upload an updated document</h1>');
				expect(element.innerHTML).toContain('<div class="govuk-grid-row pins-file-upload"');
				expect(element.innerHTML).toContain('Choose file</button>');
			});
		});

		describe('POST /costs/decision/upload-documents/:folderId/:documentId', () => {
			const costsFolder = appealData.costs.decisionFolder;

			it(`should render a 500 error page if upload-info is not present in the request body`, async () => {
				const response = await request
					.post(`${baseUrl}/1/costs/decision/upload-documents/${costsFolder.folderId}/1`)
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
					.post(`${baseUrl}/1/costs/decision/upload-documents/${costsFolder.folderId}/1`)
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
					.post(`${baseUrl}/1/costs/decision/upload-documents/${costsFolder.folderId}/1`)
					.send({
						'upload-info': fileUploadInfo
					});

				expect(response.statusCode).toBe(302);
				expect(response.text).toBe(
					`Found. Redirecting to /appeals-service/appeal-details/1/costs/decision/add-document-details/${costsFolder.folderId}/1`
				);
			});
		});

		describe('GET /costs/decision/add-document-details/:folderId', () => {
			const costsFolder = appealData.costs.decisionFolder;

			it(`should render a 500 error page if fileUploadInfo is not present in the session`, async () => {
				const response = await request.get(
					`${baseUrl}/1/costs/decision/add-document-details/${costsFolder.folderId}`
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
					.post(`${baseUrl}/1/costs/decision/upload-documents/${costsFolder.folderId}`)
					.send({
						'upload-info': fileUploadInfo
					});

				expect(addDocumentsResponse.statusCode).toBe(302);

				const response = await request.get(
					`${baseUrl}/1/costs/decision/add-document-details/${costsFolder.folderId}`
				);

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
				expect(unprettifiedElement.innerHTML).toContain(`Costs decision document</h1>`);
				expect(unprettifiedElement.innerHTML).toContain('test-document.txt</h2>');
				expect(unprettifiedElement.innerHTML).toContain('Decision date</legend>');
				expect(unprettifiedElement.innerHTML).toContain('Redaction status</legend>');
			});

			it(`should render a back link to the upload document page`, async () => {
				const addDocumentsResponse = await request
					.post(`${baseUrl}/1/costs/decision/upload-documents/${costsFolder.folderId}`)
					.send({
						'upload-info': fileUploadInfo
					});

				expect(addDocumentsResponse.statusCode).toBe(302);

				const response = await request.get(
					`${baseUrl}/1/costs/decision/add-document-details/${costsFolder.folderId}`
				);
				const element = parseHtml(response.text, {
					rootElement: '.govuk-back-link',
					skipPrettyPrint: true
				});

				expect(element.innerHTML).toContain(
					`href="/appeals-service/appeal-details/1/costs/decision/upload-documents/${costsFolder.folderId}"`
				);
			});
		});

		describe('POST /costs/decision/add-document-details/:folderId', () => {
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

				const costsFolder = appealData.costs.decisionFolder;

				addDocumentsResponse = await request
					.post(`${baseUrl}/1/costs/decision/upload-documents/${costsFolder.folderId}`)
					.send({
						'upload-info': fileUploadInfo
					});
			});

			const costsFolder = appealData.costs.decisionFolder;

			it(`should re-render the document details page with the expected error message if the request body is in an incorrect format`, async () => {
				expect(addDocumentsResponse.statusCode).toBe(302);

				const response = await request
					.post(`${baseUrl}/1/costs/decision/add-document-details/${costsFolder.folderId}`)
					.send({});

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
				expect(unprettifiedElement.innerHTML).toContain(`Costs decision document</h1>`);

				const errorSummaryElement = parseHtml(response.text, {
					rootElement: '.govuk-error-summary'
				});

				expect(errorSummaryElement.innerHTML).toContain('There is a problem with the service');
			});

			it(`should re-render the document details page with the expected error message if receivedDate day is an invalid value`, async () => {
				expect(addDocumentsResponse.statusCode).toBe(302);

				const testCases = [
					{ value: '', expectedError: 'Received date must include a day' },
					{ value: 'a', expectedError: 'Received date day must be a number' },
					{ value: '0', expectedError: 'Received date day must be between 1 and 31' },
					{ value: '32', expectedError: 'Received date day must be between 1 and 31' }
				];

				for (const testCase of testCases) {
					const response = await request
						.post(`${baseUrl}/1/costs/decision/add-document-details/${costsFolder.folderId}`)
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
					expect(unprettifiedElement.innerHTML).toContain(`Costs decision document</h1>`);

					const errorSummaryElement = parseHtml(response.text, {
						rootElement: '.govuk-error-summary'
					});

					expect(errorSummaryElement.innerHTML).toContain(testCase.expectedError);
				}
			});

			it(`should re-render the document details page with the expected error message if receivedDate month is an invalid value`, async () => {
				expect(addDocumentsResponse.statusCode).toBe(302);

				const testCases = [
					{ value: '', expectedError: 'Received date must include a month' },
					{ value: 'a', expectedError: 'Received date must be a real date' },
					{ value: '0', expectedError: 'Received date month must be between 1 and 12' },
					{ value: '13', expectedError: 'Received date month must be between 1 and 12' }
				];

				for (const testCase of testCases) {
					const response = await request
						.post(`${baseUrl}/1/costs/decision/add-document-details/${costsFolder.folderId}`)
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
					expect(unprettifiedElement.innerHTML).toContain(`Costs decision document</h1>`);

					const errorSummaryElement = parseHtml(response.text, {
						rootElement: '.govuk-error-summary'
					});

					expect(errorSummaryElement.innerHTML).toContain(testCase.expectedError);
				}
			});

			it(`should re-render the document details page with the expected error message if receivedDate year is an invalid value`, async () => {
				expect(addDocumentsResponse.statusCode).toBe(302);

				const testCases = [
					{ value: '', expectedError: 'Received date must include a year' },
					{ value: 'a', expectedError: 'Received date year must be a number' },
					{ value: '202', expectedError: 'Received date year must be 4 digits' }
				];

				for (const testCase of testCases) {
					const response = await request
						.post(`${baseUrl}/1/costs/decision/add-document-details/${costsFolder.folderId}`)
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
					expect(unprettifiedElement.innerHTML).toContain(`Costs decision document</h1>`);

					const errorSummaryElement = parseHtml(response.text, {
						rootElement: '.govuk-error-summary'
					});

					expect(errorSummaryElement.innerHTML).toContain(testCase.expectedError);
				}
			});

			it(`should re-render the document details page with the expected error message if receivedDate is not a valid date`, async () => {
				expect(addDocumentsResponse.statusCode).toBe(302);

				const response = await request
					.post(`${baseUrl}/1/costs/decision/add-document-details/${costsFolder.folderId}`)
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
				expect(unprettifiedElement.innerHTML).toContain(`Costs decision document</h1>`);

				const errorSummaryElement = parseHtml(response.text, {
					rootElement: '.govuk-error-summary'
				});

				expect(errorSummaryElement.innerHTML).toContain('date must be a real date');
			});

			it(`should send a patch request to the appeal documents endpoint and redirect to the check and confirm page, if complete and valid document details were provided`, async () => {
				expect(addDocumentsResponse.statusCode).toBe(302);

				const response = await request
					.post(`${baseUrl}/1/costs/decision/add-document-details/${costsFolder.folderId}`)
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
					`Found. Redirecting to /appeals-service/appeal-details/1/costs/decision/check-and-confirm/${costsFolder.folderId}`
				);
			});
		});

		describe('GET /costs/decision/add-document-details/:folderId/:documentId', () => {
			const costsFolder = appealData.costs.decisionFolder;

			it(`should render a 500 error page if fileUploadInfo is not present in the session`, async () => {
				const response = await request.get(
					`${baseUrl}/1/costs/decision/add-document-details/${costsFolder.folderId}/1`
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
					.post(`${baseUrl}/1/costs/decision/upload-documents/${costsFolder.folderId}/1`)
					.send({
						'upload-info': fileUploadInfo
					});

				expect(addDocumentsResponse.statusCode).toBe(302);

				const response = await request.get(
					`${baseUrl}/1/costs/decision/add-document-details/${costsFolder.folderId}/1`
				);

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
				expect(unprettifiedElement.innerHTML).toContain(`Costs decision document</h1>`);
				expect(unprettifiedElement.innerHTML).toContain('test-document.txt</h2>');
				expect(unprettifiedElement.innerHTML).toContain('Decision date</legend>');
				expect(unprettifiedElement.innerHTML).toContain('Redaction status</legend>');
			});

			it(`should render a back link to the upload document version page`, async () => {
				const addDocumentsResponse = await request
					.post(`${baseUrl}/1/costs/decision/upload-documents/${costsFolder.folderId}/1`)
					.send({
						'upload-info': fileUploadInfo
					});

				expect(addDocumentsResponse.statusCode).toBe(302);

				const response = await request.get(
					`${baseUrl}/1/costs/decision/add-document-details/${costsFolder.folderId}/1`
				);
				const element = parseHtml(response.text, {
					rootElement: '.govuk-back-link',
					skipPrettyPrint: true
				});

				expect(element.innerHTML).toContain(
					`href="/appeals-service/appeal-details/1/costs/decision/upload-documents/${costsFolder.folderId}/1"`
				);
			});
		});

		describe('POST /costs/decision/add-document-details/:folderId/:documentId', () => {
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

				const costsFolder = appealData.costs.decisionFolder;

				addDocumentsResponse = await request
					.post(`${baseUrl}/1/costs/decision/upload-documents/${costsFolder.folderId}/1`)
					.send({
						'upload-info': fileUploadInfo
					});
			});

			const costsFolder = appealData.costs.decisionFolder;

			it(`should re-render the document details page with the expected error message if the request body is in an incorrect format`, async () => {
				expect(addDocumentsResponse.statusCode).toBe(302);

				const response = await request
					.post(`${baseUrl}/1/costs/decision/add-document-details/${costsFolder.folderId}/1`)
					.send({});

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
				expect(unprettifiedElement.innerHTML).toContain(`Costs decision document</h1>`);

				const errorSummaryElement = parseHtml(response.text, {
					rootElement: '.govuk-error-summary'
				});

				expect(errorSummaryElement.innerHTML).toContain('There is a problem with the service');
			});

			it(`should re-render the document details page with the expected error message if receivedDate day is an invalid value`, async () => {
				expect(addDocumentsResponse.statusCode).toBe(302);

				const testCases = [
					{ value: '', expectedError: 'Received date must include a day' },
					{ value: 'a', expectedError: 'Received date day must be a number' },
					{ value: '0', expectedError: 'Received date day must be between 1 and 31' },
					{ value: '32', expectedError: 'Received date day must be between 1 and 31' }
				];

				for (const testCase of testCases) {
					const response = await request
						.post(`${baseUrl}/1/costs/decision/add-document-details/${costsFolder.folderId}/1`)
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
					expect(unprettifiedElement.innerHTML).toContain(`Costs decision document</h1>`);

					const errorSummaryElement = parseHtml(response.text, {
						rootElement: '.govuk-error-summary'
					});

					expect(errorSummaryElement.innerHTML).toContain(testCase.expectedError);
				}
			});

			it(`should re-render the document details page with the expected error message if receivedDate month is an invalid value`, async () => {
				expect(addDocumentsResponse.statusCode).toBe(302);

				const testCases = [
					{ value: '', expectedError: 'Received date must include a month' },
					{ value: 'a', expectedError: 'Received date must be a real date' },
					{ value: '0', expectedError: 'Received date month must be between 1 and 12' },
					{ value: '13', expectedError: 'Received date month must be between 1 and 12' }
				];

				for (const testCase of testCases) {
					const response = await request
						.post(`${baseUrl}/1/costs/decision/add-document-details/${costsFolder.folderId}/1`)
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
					expect(unprettifiedElement.innerHTML).toContain(`Costs decision document</h1>`);

					const errorSummaryElement = parseHtml(response.text, {
						rootElement: '.govuk-error-summary'
					});

					expect(errorSummaryElement.innerHTML).toContain(testCase.expectedError);
				}
			});

			it(`should re-render the document details page with the expected error message if receivedDate year is an invalid value`, async () => {
				expect(addDocumentsResponse.statusCode).toBe(302);

				const testCases = [
					{ value: '', expectedError: 'Received date must include a year' },
					{ value: 'a', expectedError: 'Received date year must be a number' },
					{ value: '202', expectedError: 'Received date year must be 4 digits' }
				];

				for (const testCase of testCases) {
					const response = await request
						.post(`${baseUrl}/1/costs/decision/add-document-details/${costsFolder.folderId}/1`)
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
					expect(unprettifiedElement.innerHTML).toContain(`Costs decision document</h1>`);

					const errorSummaryElement = parseHtml(response.text, {
						rootElement: '.govuk-error-summary'
					});

					expect(errorSummaryElement.innerHTML).toContain(testCase.expectedError);
				}
			});

			it(`should re-render the document details page with the expected error message if receivedDate is not a valid date`, async () => {
				expect(addDocumentsResponse.statusCode).toBe(302);

				const response = await request
					.post(`${baseUrl}/1/costs/decision/add-document-details/${costsFolder.folderId}/1`)
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
				expect(unprettifiedElement.innerHTML).toContain(`Costs decision document</h1>`);

				const errorSummaryElement = parseHtml(response.text, {
					rootElement: '.govuk-error-summary'
				});

				expect(errorSummaryElement.innerHTML).toContain('date must be a real date');
			});

			it('should send a patch request to the appeal documents endpoint and redirect to the check and confirm page, when month is a number, if complete and valid document details were provided', async () => {
				const response = await request
					.post(`${baseUrl}/1/costs/decision/add-document-details/${costsFolder.folderId}/1`)
					.send({
						items: [
							{
								documentId: '4541e025-00e1-4458-aac6-d1b51f6ae0a7',
								receivedDate: {
									day: '3',
									month: '2',
									year: '2023'
								},
								redactionStatus: 2
							}
						]
					});

				expect(response.statusCode).toBe(302);
				expect(response.text).toEqual(
					`Found. Redirecting to /appeals-service/appeal-details/1/costs/decision/check-and-confirm/${costsFolder.folderId}/1`
				);
			});

			it('should send a patch request to the appeal documents endpoint and redirect to the check and confirm page, when month is an abbreviation, if complete and valid document details were provided', async () => {
				const response = await request
					.post(`${baseUrl}/1/costs/decision/add-document-details/${costsFolder.folderId}/1`)
					.send({
						items: [
							{
								documentId: '4541e025-00e1-4458-aac6-d1b51f6ae0a7',
								receivedDate: {
									day: '3',
									month: 'Feb',
									year: '2023'
								},
								redactionStatus: 2
							}
						]
					});

				expect(response.statusCode).toBe(302);
				expect(response.text).toEqual(
					`Found. Redirecting to /appeals-service/appeal-details/1/costs/decision/check-and-confirm/${costsFolder.folderId}/1`
				);
			});

			it('should send a patch request to the appeal documents endpoint and redirect to the check and confirm page, when month is a full name, if complete and valid document details were provided', async () => {
				const response = await request
					.post(`${baseUrl}/1/costs/decision/add-document-details/${costsFolder.folderId}/1`)
					.send({
						items: [
							{
								documentId: '4541e025-00e1-4458-aac6-d1b51f6ae0a7',
								receivedDate: {
									day: '3',
									month: 'February',
									year: '2023'
								},
								redactionStatus: 2
							}
						]
					});

				expect(response.statusCode).toBe(302);
				expect(response.text).toEqual(
					`Found. Redirecting to /appeals-service/appeal-details/1/costs/decision/check-and-confirm/${costsFolder.folderId}/1`
				);
			});
		});

		describe('GET /costs/decision/check-and-confirm/:folderId', () => {
			/**
			 * @type {import("superagent").Response}
			 */
			let addDocumentsResponse;

			const costsDecisionFolder = appealData.costs.decisionFolder;

			beforeEach(async () => {
				addDocumentsResponse = await request
					.post(`${baseUrl}/1/costs/decision/upload-documents/${costsDecisionFolder?.folderId}`)
					.send({
						'upload-info': fileUploadInfo
					});
			});

			it('should render a 404 error page if the folderId is not valid', async () => {
				expect(addDocumentsResponse.statusCode).toBe(302);

				const response = await request.get(`${baseUrl}/1/costs/decision/check-and-confirm/99`);

				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Page not found</h1>');
			});

			it('should render the check and confirm costs decision page if the folderId is valid', async () => {
				expect(addDocumentsResponse.statusCode).toBe(302);

				const response = await request.get(
					`${baseUrl}/1/costs/decision/check-and-confirm/${costsDecisionFolder?.folderId}`
				);

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Check your answers</h1>');
				expect(unprettifiedElement.innerHTML).toContain(
					'Warning</span> You must email the relevant parties to inform them of the decision.'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'name="confirm" type="checkbox" value="yes">'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'for="confirm"> I will email the relevant parties'
				);
			});
		});

		describe('POST /costs/decision/check-and-confirm/:folderId', () => {
			/**
			 * @type {import("superagent").Response}
			 */
			let addDocumentsResponse;

			const costsDecisionFolder = appealData.costs.decisionFolder;

			beforeEach(async () => {
				addDocumentsResponse = await request
					.post(`${baseUrl}/1/costs/decision/upload-documents/${costsDecisionFolder?.folderId}`)
					.send({
						'upload-info': fileUploadInfo
					});
			});

			it('should render a 404 error page if the folderId is not valid', async () => {
				expect(addDocumentsResponse.statusCode).toBe(302);

				const response = await request
					.post(`${baseUrl}/1/costs/decision/check-and-confirm/99`)
					.send({
						confirm: 'yes'
					});

				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Page not found</h1>');
			});

			it('should re-render the check and confirm costs decision page with the expected error message if confirmation was not provided', async () => {
				expect(addDocumentsResponse.statusCode).toBe(302);

				const response = await request
					.post(`${baseUrl}/1/costs/decision/check-and-confirm/${costsDecisionFolder?.folderId}`)
					.send({});

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Check your answers</h1>');
				expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
				expect(unprettifiedElement.innerHTML).toContain(
					'Select that you will email the relevant parties</a></li>'
				);
			});

			it('should redirect to the case details page if confirmation was provided', async () => {
				expect(addDocumentsResponse.statusCode).toBe(302);

				const mockDocumentsEndpoint = nock('http://test/').post('/appeals/1/documents').reply(200);
				const response = await request
					.post(`${baseUrl}/1/costs/decision/check-and-confirm/3`)
					.send({
						confirm: 'yes'
					});

				expect(mockDocumentsEndpoint.isDone()).toBe(true);
				expect(response.statusCode).toBe(302);
				expect(response.text).toEqual(`Found. Redirecting to /appeals-service/appeal-details/1`);
			});
		});

		describe('GET /costs/decision/check-and-confirm/:folderId/:documentId', () => {
			/**
			 * @type {import("superagent").Response}
			 */
			let addDocumentsResponse;

			const costsDecisionFolder = appealData.costs.decisionFolder;

			beforeEach(async () => {
				addDocumentsResponse = await request
					.post(`${baseUrl}/1/costs/decision/upload-documents/${costsDecisionFolder?.folderId}/1`)
					.send({
						'upload-info': fileUploadInfo
					});
			});

			it('should render a 404 error page if the folderId is not valid', async () => {
				expect(addDocumentsResponse.statusCode).toBe(302);

				const response = await request.get(`${baseUrl}/1/costs/decision/check-and-confirm/99/1`);

				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Page not found</h1>');
			});

			it('should render a 404 error page if the documentId is not valid', async () => {
				expect(addDocumentsResponse.statusCode).toBe(302);

				const response = await request.get(`${baseUrl}/1/costs/decision/check-and-confirm/1/99`);

				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Page not found</h1>');
			});

			it('should render the check and confirm costs decision page if the folderId and documentId are both valid', async () => {
				expect(addDocumentsResponse.statusCode).toBe(302);

				const response = await request.get(
					`${baseUrl}/1/costs/decision/check-and-confirm/${costsDecisionFolder?.folderId}/1`
				);

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Check your answers</h1>');
				expect(unprettifiedElement.innerHTML).toContain('Updated costs decision</dt>');
				expect(unprettifiedElement.innerHTML).toContain(
					'<a class="govuk-link" href="/documents/APP/Q9999/D/21/351062/download-uncommitted/1/ph0-documentFileInfo.jpeg/2" target="_blank">test-document.txt</a>'
				);
				expect(unprettifiedElement.innerHTML).toContain('Decision date</dt>');
				expect(unprettifiedElement.innerHTML).toContain(
					'Warning</span> You must email the relevant parties to inform them of the decision.'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'name="confirm" type="checkbox" value="yes">'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'for="confirm"> I will email the relevant parties'
				);
			});
		});

		describe('POST /costs/decision/check-and-confirm/:folderId/:documentId', () => {
			/**
			 * @type {import("superagent").Response}
			 */
			let addDocumentsResponse;

			const costsDecisionFolder = appealData.costs.decisionFolder;

			beforeEach(async () => {
				addDocumentsResponse = await request
					.post(`${baseUrl}/1/costs/decision/upload-documents/${costsDecisionFolder?.folderId}`)
					.send({
						'upload-info': fileUploadInfo
					});
			});

			it('should render a 404 error page if the folderId is not valid', async () => {
				expect(addDocumentsResponse.statusCode).toBe(302);

				const response = await request
					.post(`${baseUrl}/1/costs/decision/check-and-confirm/99/1`)
					.send({
						confirm: 'yes'
					});

				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Page not found</h1>');
			});

			it('should re-render the check and confirm costs decision page with the expected error message if confirmation was not provided', async () => {
				expect(addDocumentsResponse.statusCode).toBe(302);

				const response = await request
					.post(`${baseUrl}/1/costs/decision/check-and-confirm/${costsDecisionFolder?.folderId}/1`)
					.send({});

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Check your answers</h1>');
				expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
				expect(unprettifiedElement.innerHTML).toContain(
					'Select that you will email the relevant parties</a></li>'
				);
			});

			it('should redirect to the case details page if confirmation was provided', async () => {
				expect(addDocumentsResponse.statusCode).toBe(302);

				const mockDocumentsEndpoint = nock('http://test/')
					.post('/appeals/1/documents/1')
					.reply(200);
				const response = await request
					.post(`${baseUrl}/1/costs/decision/check-and-confirm/${costsDecisionFolder?.folderId}/1`)
					.send({
						confirm: 'yes'
					});

				expect(mockDocumentsEndpoint.isDone()).toBe(true);
				expect(response.statusCode).toBe(302);
				expect(response.text).toEqual(`Found. Redirecting to /appeals-service/appeal-details/1`);
			});
		});

		describe('GET /costs/decision/manage-documents/:folderId', () => {
			beforeEach(() => {
				usersService.getUserByRoleAndId = jest.fn().mockResolvedValue(activeDirectoryUsersData[0]);
			});

			const costsFolder = appealData.costs.decisionFolder;

			it(`should render a 404 error page if the folderId is not valid`, async () => {
				const response = await request.get(`${baseUrl}/1/costs/decision/manage-documents/99`);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();
				expect(element.innerHTML).toContain('Page not found</h1>');
			});

			it(`should render the manage folder page with one document item for each document present in the folder if the folderId is valid`, async () => {
				const response = await request.get(
					`${baseUrl}/1/costs/decision/manage-documents/${costsFolder?.folderId}`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Manage folder</span><h1');
				expect(unprettifiedElement.innerHTML).toContain(`Costs decision documents</h1>`);
				expect(unprettifiedElement.innerHTML).toContain(
					`<a href="/appeals-service/appeal-details/1/costs/decision/upload-documents/7" role="button" draggable="false" class="govuk-button govuk-button--secondary" data-module="govuk-button"> Add documents</a>`
				);
			});
		});

		describe('GET /costs/decision/manage-documents/:folderId/:documentId', () => {
			beforeEach(() => {
				usersService.getUsersByRole = jest.fn().mockResolvedValue(activeDirectoryUsersData);

				usersService.getUserByRoleAndId = jest.fn().mockResolvedValue(activeDirectoryUsersData[0]);

				usersService.getUserById = jest.fn().mockResolvedValue(activeDirectoryUsersData[0]);
			});

			const costsFolder = appealData.costs.decisionFolder;

			it(`should render a 404 error page if the folderId is not valid`, async () => {
				nock('http://test/')
					.get('/appeals/1/documents/1/versions')
					.reply(200, documentFileVersionsInfo);

				const response = await request.get(`${baseUrl}/1/costs/decision/manage-documents/99/1`);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const h1Element = parseHtml(response.text, { rootElement: 'main h1' });

				expect(h1Element.innerHTML).toContain('Page not found');
			});

			it(`should render a 404 error page if the documentId is not valid`, async () => {
				nock('http://test/')
					.get('/appeals/1/documents/1/versions')
					.reply(200, documentFileVersionsInfo);

				const response = await request.get(
					`${baseUrl}/1/costs/decision/manage-documents/${costsFolder?.folderId}/99`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const h1Element = parseHtml(response.text, { rootElement: 'main h1' });

				expect(h1Element.innerHTML).toContain('Page not found');
			});

			it(`should render the manage individual document page with the expected content if the folderId and documentId are both valid and the document virus check status is null`, async () => {
				nock('http://test/')
					.get('/appeals/1/documents/1/versions')
					.reply(200, documentFileVersionsInfo);

				const response = await request.get(
					`${baseUrl}/1/costs/decision/manage-documents/${costsFolder?.folderId}/1`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain(
					'test-pdf-documentFileVersionsInfo.pdf</h1>'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'<strong class="govuk-tag govuk-tag--yellow">Virus scanning</strong>'
				);
				expect(unprettifiedElement.innerHTML).not.toContain('Upload a new version');
				expect(unprettifiedElement.innerHTML).not.toContain('Remove current version');
			});

			it(`should render the manage individual document page with the expected content if the folderId and documentId are both valid and the document virus check status is "not_scanned"`, async () => {
				nock('http://test/')
					.get('/appeals/1/documents/1/versions')
					.reply(200, documentFileVersionsInfoNotChecked);

				const response = await request.get(
					`${baseUrl}/1/costs/decision/manage-documents/${costsFolder?.folderId}/1`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain(
					'test-pdf-documentFileVersionsInfo.pdf</h1>'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'<strong class="govuk-tag govuk-tag--yellow">Virus scanning</strong>'
				);
				expect(unprettifiedElement.innerHTML).not.toContain('Upload a new version');
				expect(unprettifiedElement.innerHTML).not.toContain('Remove current version');
			});

			it(`should render the manage individual document page with the expected content if the folderId and documentId are both valid and the document virus check status is "affected"`, async () => {
				nock('http://test/')
					.get('/appeals/1/documents/1/versions')
					.reply(200, documentFileVersionsInfoVirusFound);

				const response = await request.get(
					`${baseUrl}/1/costs/decision/manage-documents/${costsFolder?.folderId}/1`
				);

				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain(
					'test-pdf-documentFileVersionsInfo.pdf</h1>'
				);
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
					.get('/appeals/1/documents/1/versions')
					.reply(200, documentFileVersionsInfoChecked);

				const response = await request.get(
					`${baseUrl}/1/costs/decision/manage-documents/${costsFolder?.folderId}/1`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain(
					'test-pdf-documentFileVersionsInfo.pdf</h1>'
				);
				expect(unprettifiedElement.innerHTML).not.toContain(
					'<strong class="govuk-tag govuk-tag--yellow">Virus scanning</strong>'
				);
				expect(unprettifiedElement.innerHTML).not.toContain(
					'<strong class="govuk-tag govuk-tag--red">Virus detected</strong>'
				);
				expect(unprettifiedElement.innerHTML).toContain('Upload a new version');
				expect(unprettifiedElement.innerHTML).toContain('Remove current version');
			});
		});

		describe('GET /costs/decision/manage-documents/:folderId/:documentId/:versionId/delete', () => {
			const costsFolder = appealData.costs.decisionFolder;

			it(`should render the delete document page with the expected content when there is a single document version`, async () => {
				nock('http://test/')
					.get('/appeals/1/documents/1/versions')
					.reply(200, documentFileVersionsInfoChecked);

				const response = await request.get(
					`${baseUrl}/1/costs/decision/manage-documents/${costsFolder?.folderId}/1/1/delete`
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
					.get('/appeals/1/documents/1/versions')
					.reply(200, multipleVersionsDocument);

				const response = await request.get(
					`${baseUrl}/1/costs/decision/manage-documents/${costsFolder?.folderId}/1/1/delete`
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

		describe('POST /costs/decision/manage-documents/:folderId/:documentId/:versionId/delete', () => {
			beforeEach(() => {
				nock('http://test/').delete('/appeals/1/documents/1/1').reply(200, {
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

			const costsFolder = appealData.costs.decisionFolder;

			it(`should re-render the delete document page with the expected error message if answer was not provided`, async () => {
				nock('http://test/')
					.get('/appeals/1/documents/1/versions')
					.reply(200, documentFileVersionsInfo);

				const response = await request
					.post(`${baseUrl}/1/costs/decision/manage-documents/${costsFolder?.folderId}/1/1/delete`)
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
					.get('/appeals/1/documents/1/versions')
					.reply(200, documentFileVersionsInfo);

				const response = await request
					.post(`${baseUrl}/1/costs/decision/manage-documents/${costsFolder?.folderId}/1/1/delete`)
					.send({
						'delete-file-answer': 'no'
					});

				expect(response.statusCode).toBe(302);
				expect(response.text).toContain('Found. Redirecting to ');
				expect(response.text).toContain(
					`/appeals-service/appeal-details/1/costs/decision/manage-documents/${costsFolder?.folderId}/1`
				);
			});

			it(`should send an API request to delete the document, and redirect to the case details page, if answer "yes" was provided`, async () => {
				nock('http://test/')
					.get('/appeals/1/documents/1/versions')
					.reply(200, documentFileVersionsInfo);

				const response = await request
					.post(`${baseUrl}/1/costs/decision/manage-documents/${costsFolder?.folderId}/1/1/delete`)
					.send({
						'delete-file-answer': 'yes'
					});

				expect(response.statusCode).toBe(302);
				expect(response.text).toContain('Found. Redirecting to ');
				expect(response.text).toContain('/appeals-service/appeal-details/1');
			});
		});
	});
});
