import { jest } from '@jest/globals';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';
import {
	appealData,
	documentRedactionStatuses,
	fileUploadInfo,
	documentFileInfo,
	folderInfoCrossTeamCorrespondence,
	folderInfoInspectorCorrespondence,
	activeDirectoryUsersData,
	documentFileVersionsInfo,
	documentFileVersionsInfoNotChecked,
	documentFileVersionsInfoChecked,
	documentFileVersionsInfoVirusFound,
	documentFolderInfo
} from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { dateISOStringToDisplayDate } from '#lib/dates.js';
import usersService from '#appeals/appeal-users/users-service.js';
import { cloneDeep } from 'lodash-es';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';

describe('internal correspondence', () => {
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('GET /internal-correspondence/:correspondenceCategory/upload-documents/:folderId', () => {
		const correspondenceCategories = ['cross-team', 'inspector'];

		beforeEach(async () => {
			nock('http://test/')
				.get('/appeals/1/document-folders/10')
				.reply(200, folderInfoCrossTeamCorrespondence)
				.persist();
			nock('http://test/')
				.get('/appeals/1/document-folders/11')
				.reply(200, folderInfoInspectorCorrespondence)
				.persist();
		});

		for (const correspondenceCategory of correspondenceCategories) {
			const folder =
				// @ts-ignore
				appealData.internalCorrespondence[
					`${correspondenceCategory === 'cross-team' ? 'crossTeam' : correspondenceCategory}`
				];

			it(`should render the upload documents page (${correspondenceCategory})`, async () => {
				const response = await request.get(
					`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/upload-documents/${folder.folderId}`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain(
					`Upload ${correspondenceCategory} correspondence</h1>`
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'<div class="govuk-grid-row pins-file-upload"'
				);
				expect(unprettifiedElement.innerHTML).toContain('Select files</button>');
			});
		}
	});

	describe('POST /internal-correspondence/:correspondenceCategory/upload-documents/:folderId', () => {
		const correspondenceCategories = ['cross-team', 'inspector'];

		beforeEach(() => {
			nock.cleanAll();
			nock('http://test/').get('/appeals/1').reply(200, appealData).persist();
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses);
			nock('http://test/')
				.get('/appeals/1/document-folders/10')
				.reply(200, folderInfoCrossTeamCorrespondence)
				.persist();
			nock('http://test/')
				.get('/appeals/1/document-folders/11')
				.reply(200, folderInfoInspectorCorrespondence)
				.persist();
		});
		afterEach(() => {
			nock.cleanAll();
		});

		for (const correspondenceCategory of correspondenceCategories) {
			const folder =
				// @ts-ignore
				appealData.internalCorrespondence[
					`${correspondenceCategory === 'cross-team' ? 'crossTeam' : correspondenceCategory}`
				];

			it(`should render a 500 error page if upload-info is not present in the request body (${correspondenceCategory})`, async () => {
				const response = await request
					.post(
						`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/upload-documents/${folder.folderId}`
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

			it(`should render a 500 error page if request body upload-info is in an incorrect format (${correspondenceCategory})`, async () => {
				const response = await request
					.post(
						`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/upload-documents/${folder.folderId}`
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

			it(`should redirect to the add document details page if upload-info is present in the request body and in the correct format (${correspondenceCategory})`, async () => {
				const response = await request
					.post(
						`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/upload-documents/${folder.folderId}`
					)
					.send({
						'upload-info': fileUploadInfo
					});

				expect(response.statusCode).toBe(302);
				expect(response.text).toBe(
					`Found. Redirecting to /appeals-service/appeal-details/1/internal-correspondence/${correspondenceCategory}/add-document-details/${folder.folderId}`
				);
			});
		}
	});

	describe('GET /internal-correspondence/:correspondenceCategory/upload-documents/:folderId/:documentId', () => {
		const correspondenceCategories = ['cross-team', 'inspector'];

		beforeEach(async () => {
			nock('http://test/')
				.get('/appeals/1/document-folders/10')
				.reply(200, folderInfoCrossTeamCorrespondence)
				.persist();
			nock('http://test/')
				.get('/appeals/1/document-folders/11')
				.reply(200, folderInfoInspectorCorrespondence)
				.persist();
			nock('http://test/').get('/appeals/1/documents/1').reply(200, documentFileInfo);
			nock('http://test/')
				.get('/appeals/1/documents/1/versions')
				.reply(200, documentFileVersionsInfo);
		});

		for (const correspondenceCategory of correspondenceCategories) {
			const folder =
				// @ts-ignore
				appealData.internalCorrespondence[
					`${correspondenceCategory === 'cross-team' ? 'crossTeam' : correspondenceCategory}`
				];

			it(`should render the upload document version page (${correspondenceCategory})`, async () => {
				const response = await request.get(
					`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/upload-documents/${folder.folderId}/1`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();
				expect(element.innerHTML).toContain('Upload an updated document</h1>');
				expect(element.innerHTML).toContain('<div class="govuk-grid-row pins-file-upload"');
				expect(element.innerHTML).toContain('Select files</button>');
			});
		}
	});

	describe('POST /internal-correspondence/:correspondenceCategory/upload-documents/:folderId/:documentId', () => {
		const correspondenceCategories = ['cross-team', 'inspector'];

		beforeEach(() => {
			nock.cleanAll();
			nock('http://test/').get('/appeals/1').reply(200, appealData).persist();
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses);
			nock('http://test/')
				.get('/appeals/1/document-folders/10')
				.reply(200, folderInfoCrossTeamCorrespondence)
				.persist();
			nock('http://test/')
				.get('/appeals/1/document-folders/11')
				.reply(200, folderInfoInspectorCorrespondence)
				.persist();
			nock('http://test/').get('/appeals/1/documents/1').reply(200, documentFileInfo);
		});
		afterEach(() => {
			nock.cleanAll();
		});

		for (const correspondenceCategory of correspondenceCategories) {
			const folder =
				// @ts-ignore
				appealData.internalCorrespondence[
					`${correspondenceCategory === 'cross-team' ? 'crossTeam' : correspondenceCategory}`
				];

			it(`should render a 500 error page if upload-info is not present in the request body (${correspondenceCategory})`, async () => {
				const response = await request
					.post(
						`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/upload-documents/${folder.folderId}/1`
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

			it(`should render a 500 error page if request body upload-info is in an incorrect format (${correspondenceCategory})`, async () => {
				const response = await request
					.post(
						`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/upload-documents/${folder.folderId}/1`
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

			it(`should redirect to the add document details page if upload-info is present in the request body and in the correct format (${correspondenceCategory})`, async () => {
				const response = await request
					.post(
						`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/upload-documents/${folder.folderId}/1`
					)
					.send({
						'upload-info': fileUploadInfo
					});

				expect(response.statusCode).toBe(302);
				expect(response.text).toBe(
					`Found. Redirecting to /appeals-service/appeal-details/1/internal-correspondence/${correspondenceCategory}/add-document-details/${folder.folderId}/1`
				);
			});
		}
	});

	describe('GET /internal-correspondence/:correspondenceCategory/add-document-details/:folderId', () => {
		const correspondenceCategories = ['cross-team', 'inspector'];

		beforeEach(async () => {
			nock('http://test/')
				.get('/appeals/1/document-folders/10')
				.reply(200, folderInfoCrossTeamCorrespondence)
				.persist();
			nock('http://test/')
				.get('/appeals/1/document-folders/11')
				.reply(200, folderInfoInspectorCorrespondence)
				.persist();
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses)
				.persist();
		});

		for (const correspondenceCategory of correspondenceCategories) {
			const folder =
				// @ts-ignore
				appealData.internalCorrespondence[
					`${correspondenceCategory === 'cross-team' ? 'crossTeam' : correspondenceCategory}`
				];

			it(`should render a 500 error page if fileUploadInfo is not present in the session (${correspondenceCategory})`, async () => {
				const response = await request.get(
					`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/add-document-details/${folder.folderId}`
				);

				expect(response.statusCode).toBe(500);
				const element = parseHtml(response.text);
				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain(
					'Sorry, there is a problem with the service</h1>'
				);
			});

			it(`should render the document details page with one item per uploaded document (${correspondenceCategory})`, async () => {
				const addDocumentsResponse = await request
					.post(
						`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/upload-documents/${folder.folderId}`
					)
					.send({
						'upload-info': fileUploadInfo
					});

				expect(addDocumentsResponse.statusCode).toBe(302);
				expect(addDocumentsResponse.text).toContain(
					`Found. Redirecting to /appeals-service/appeal-details/1/internal-correspondence/${correspondenceCategory}/add-document-details/${folder.folderId}`
				);

				const response = await request.get(
					`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/add-document-details/${folder.folderId}`
				);

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
				expect(unprettifiedElement.innerHTML).toContain(
					`${
						correspondenceCategory === 'cross-team' ? 'Cross-team' : 'Inspector'
					} correspondence</h1>`
				);
				expect(unprettifiedElement.innerHTML).toContain('test-document.txt</h2>');
				expect(unprettifiedElement.innerHTML).toContain('Date received</legend>');
				expect(unprettifiedElement.innerHTML).toContain('Redaction status</legend>');
			});

			it(`should render a back link to the upload document page (${correspondenceCategory})`, async () => {
				const addDocumentsResponse = await request
					.post(
						`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/upload-documents/${folder.folderId}`
					)
					.send({
						'upload-info': fileUploadInfo
					});

				expect(addDocumentsResponse.statusCode).toBe(302);
				expect(addDocumentsResponse.text).toContain(
					`Found. Redirecting to /appeals-service/appeal-details/1/internal-correspondence/${correspondenceCategory}/add-document-details/${folder.folderId}`
				);

				const response = await request.get(
					`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/add-document-details/${folder.folderId}`
				);
				const element = parseHtml(response.text, {
					rootElement: '.govuk-back-link',
					skipPrettyPrint: true
				});

				expect(element.innerHTML).toContain(
					`href="/appeals-service/appeal-details/1/internal-correspondence/${correspondenceCategory}/upload-documents/${folder.folderId}"`
				);
			});
		}
	});

	describe('POST /internal-correspondence/:correspondenceCategory/add-document-details/:folderId', () => {
		const correspondenceCategories = ['cross-team', 'inspector'];
		/**
		 * @type {import("superagent").Response}
		 */
		let addDocumentsResponse;

		beforeEach(async () => {
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses)
				.persist();
			nock('http://test/')
				.get('/appeals/1/document-folders/10')
				.reply(200, folderInfoCrossTeamCorrespondence)
				.persist();
			nock('http://test/')
				.get('/appeals/1/document-folders/11')
				.reply(200, folderInfoInspectorCorrespondence)
				.persist();
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

			for (const correspondenceCategory of correspondenceCategories) {
				const folder =
					// @ts-ignore
					appealData.internalCorrespondence[
						`${correspondenceCategory === 'cross-team' ? 'crossTeam' : correspondenceCategory}`
					];

				addDocumentsResponse = await request
					.post(
						`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/upload-documents/${folder.folderId}`
					)
					.send({
						'upload-info': fileUploadInfo
					});
			}
		});

		afterEach(() => {
			nock.cleanAll();
		});

		for (const correspondenceCategory of correspondenceCategories) {
			const folder =
				// @ts-ignore
				appealData.internalCorrespondence[
					`${correspondenceCategory === 'cross-team' ? 'crossTeam' : correspondenceCategory}`
				];

			it(`should re-render the document details page with the expected error message if the request body is in an incorrect format (${correspondenceCategory})`, async () => {
				expect(addDocumentsResponse.statusCode).toBe(302);

				const response = await request
					.post(
						`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/add-document-details/${folder.folderId}`
					)
					.send({});

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
				expect(unprettifiedElement.innerHTML).toContain(
					`${
						correspondenceCategory === 'cross-team' ? 'Cross-team' : 'Inspector'
					} correspondence</h1>`
				);

				const errorSummaryElement = parseHtml(response.text, {
					rootElement: '.govuk-error-summary'
				});

				expect(errorSummaryElement.innerHTML).toContain('There is a problem with the service');
			});

			it(`should re-render the document details page with the expected error message if receivedDate day is an invalid value (${correspondenceCategory})`, async () => {
				expect(addDocumentsResponse.statusCode).toBe(302);

				const testCases = [
					{ value: '', expectedError: 'Received date must include a day' },
					{ value: 'a', expectedError: 'Received date day must be a number' },
					{ value: '0', expectedError: 'Received date day must be between 1 and 31' },
					{ value: '32', expectedError: 'Received date day must be between 1 and 31' }
				];

				for (const testCase of testCases) {
					const response = await request
						.post(
							`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/add-document-details/${folder.folderId}`
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
					expect(unprettifiedElement.innerHTML).toContain(
						`${
							correspondenceCategory === 'cross-team' ? 'Cross-team' : 'Inspector'
						} correspondence</h1>`
					);

					const errorSummaryElement = parseHtml(response.text, {
						rootElement: '.govuk-error-summary'
					});

					expect(errorSummaryElement.innerHTML).toContain(testCase.expectedError);
				}
			});

			it(`should re-render the document details page with the expected error message if receivedDate month is an invalid value (${correspondenceCategory})`, async () => {
				expect(addDocumentsResponse.statusCode).toBe(302);

				const testCases = [
					{ value: '', expectedError: 'Received date must include a month' },
					{ value: 'a', expectedError: 'Received date month must be a number' },
					{ value: '0', expectedError: 'Received date month must be between 1 and 12' },
					{ value: '13', expectedError: 'Received date month must be between 1 and 12' }
				];

				for (const testCase of testCases) {
					const response = await request
						.post(
							`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/add-document-details/${folder.folderId}`
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
					expect(unprettifiedElement.innerHTML).toContain(
						`${
							correspondenceCategory === 'cross-team' ? 'Cross-team' : 'Inspector'
						} correspondence</h1>`
					);

					const errorSummaryElement = parseHtml(response.text, {
						rootElement: '.govuk-error-summary'
					});

					expect(errorSummaryElement.innerHTML).toContain(testCase.expectedError);
				}
			});

			it(`should re-render the document details page with the expected error message if receivedDate year is an invalid value (${correspondenceCategory})`, async () => {
				expect(addDocumentsResponse.statusCode).toBe(302);

				const testCases = [
					{ value: '', expectedError: 'Received date must include a year' },
					{ value: 'a', expectedError: 'Received date year must be a number' },
					{ value: '202', expectedError: 'Received date year must be 4 digits' }
				];

				for (const testCase of testCases) {
					const response = await request
						.post(
							`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/add-document-details/${folder.folderId}`
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
					expect(unprettifiedElement.innerHTML).toContain(
						`${
							correspondenceCategory === 'cross-team' ? 'Cross-team' : 'Inspector'
						} correspondence</h1>`
					);

					const errorSummaryElement = parseHtml(response.text, {
						rootElement: '.govuk-error-summary'
					});

					expect(errorSummaryElement.innerHTML).toContain(testCase.expectedError);
				}
			});

			it(`should re-render the document details page with the expected error message if receivedDate is not a valid date (${correspondenceCategory})`, async () => {
				expect(addDocumentsResponse.statusCode).toBe(302);

				const response = await request
					.post(
						`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/add-document-details/${folder.folderId}`
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
				expect(unprettifiedElement.innerHTML).toContain(
					`${
						correspondenceCategory === 'cross-team' ? 'Cross-team' : 'Inspector'
					} correspondence</h1>`
				);

				const errorSummaryElement = parseHtml(response.text, {
					rootElement: '.govuk-error-summary'
				});

				expect(errorSummaryElement.innerHTML).toContain('Received date must be a valid date');
			});

			it(`should send a patch request to the appeal documents endpoint and redirect to the check and confirm page, if complete and valid document details were provided (${correspondenceCategory})`, async () => {
				expect(addDocumentsResponse.statusCode).toBe(302);

				const response = await request
					.post(
						`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/add-document-details/${folder.folderId}`
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
					`Found. Redirecting to /appeals-service/appeal-details/1/internal-correspondence/${correspondenceCategory}/check-your-answers/${folder.folderId}`
				);
			});
		}
	});

	describe('GET /internal-correspondence/:correspondenceCategory/add-document-details/:folderId/:documentId', () => {
		const correspondenceCategories = ['cross-team', 'inspector'];

		beforeEach(async () => {
			nock('http://test/')
				.get('/appeals/1/document-folders/10')
				.reply(200, folderInfoCrossTeamCorrespondence)
				.persist();
			nock('http://test/')
				.get('/appeals/1/document-folders/11')
				.reply(200, folderInfoInspectorCorrespondence)
				.persist();
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses)
				.persist();
		});

		for (const correspondenceCategory of correspondenceCategories) {
			const folder =
				// @ts-ignore
				appealData.internalCorrespondence[
					`${correspondenceCategory === 'cross-team' ? 'crossTeam' : correspondenceCategory}`
				];

			it(`should render a 500 error page if fileUploadInfo is not present in the session (${correspondenceCategory})`, async () => {
				const response = await request.get(
					`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/add-document-details/${folder.folderId}/1`
				);

				expect(response.statusCode).toBe(500);
				const element = parseHtml(response.text);
				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain(
					'Sorry, there is a problem with the service</h1>'
				);
			});

			it(`should render the document details page with one item per uploaded document (${correspondenceCategory})`, async () => {
				const addDocumentsResponse = await request
					.post(
						`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/upload-documents/${folder.folderId}/1`
					)
					.send({
						'upload-info': fileUploadInfo
					});

				expect(addDocumentsResponse.statusCode).toBe(302);
				expect(addDocumentsResponse.text).toContain(
					`Found. Redirecting to /appeals-service/appeal-details/1/internal-correspondence/${correspondenceCategory}/add-document-details/${folder.folderId}/1`
				);

				const response = await request.get(
					`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/add-document-details/${folder.folderId}/1`
				);

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
				expect(unprettifiedElement.innerHTML).toContain(
					`${
						correspondenceCategory === 'cross-team' ? 'Cross-team' : 'Inspector'
					} correspondence</h1>`
				);
				expect(unprettifiedElement.innerHTML).toContain('test-document.txt</h2>');
				expect(unprettifiedElement.innerHTML).toContain('Date received</legend>');
				expect(unprettifiedElement.innerHTML).toContain('Redaction status</legend>');
			});

			it(`should render a back link to the upload document version page (${correspondenceCategory})`, async () => {
				const addDocumentsResponse = await request
					.post(
						`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/upload-documents/${folder.folderId}/1`
					)
					.send({
						'upload-info': fileUploadInfo
					});

				expect(addDocumentsResponse.statusCode).toBe(302);
				expect(addDocumentsResponse.text).toContain(
					`Found. Redirecting to /appeals-service/appeal-details/1/internal-correspondence/${correspondenceCategory}/add-document-details/${folder.folderId}/1`
				);

				const response = await request.get(
					`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/add-document-details/${folder.folderId}/1`
				);
				const element = parseHtml(response.text, {
					rootElement: '.govuk-back-link',
					skipPrettyPrint: true
				});

				expect(element.innerHTML).toContain(
					`href="/appeals-service/appeal-details/1/internal-correspondence/${correspondenceCategory}/upload-documents/${folder.folderId}/1"`
				);
			});
		}
	});

	describe('POST /internal-correspondence/:correspondenceCategory/add-document-details/:folderId/:documentId', () => {
		const correspondenceCategories = ['cross-team', 'inspector'];
		/**
		 * @type {import("superagent").Response}
		 */
		let addDocumentsResponse;

		beforeEach(async () => {
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses)
				.persist();
			nock('http://test/')
				.get('/appeals/1/document-folders/10')
				.reply(200, folderInfoCrossTeamCorrespondence)
				.persist();
			nock('http://test/')
				.get('/appeals/1/document-folders/11')
				.reply(200, folderInfoInspectorCorrespondence)
				.persist();
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

			for (const correspondenceCategory of correspondenceCategories) {
				const folder =
					// @ts-ignore
					appealData.internalCorrespondence[
						`${correspondenceCategory === 'cross-team' ? 'crossTeam' : correspondenceCategory}`
					];

				addDocumentsResponse = await request
					.post(
						`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/upload-documents/${folder.folderId}/1`
					)
					.send({
						'upload-info': fileUploadInfo
					});
			}
		});

		afterEach(() => {
			nock.cleanAll();
		});

		for (const correspondenceCategory of correspondenceCategories) {
			const folder =
				// @ts-ignore
				appealData.internalCorrespondence[
					`${correspondenceCategory === 'cross-team' ? 'crossTeam' : correspondenceCategory}`
				];

			it(`should re-render the document details page with the expected error message if the request body is in an incorrect format (${correspondenceCategory})`, async () => {
				expect(addDocumentsResponse.statusCode).toBe(302);

				const response = await request
					.post(
						`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/add-document-details/${folder.folderId}/1`
					)
					.send({});

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
				expect(unprettifiedElement.innerHTML).toContain(
					`${
						correspondenceCategory === 'cross-team' ? 'Cross-team' : 'Inspector'
					} correspondence</h1>`
				);

				const errorSummaryElement = parseHtml(response.text, {
					rootElement: '.govuk-error-summary'
				});

				expect(errorSummaryElement.innerHTML).toContain('There is a problem with the service');
			});

			it(`should re-render the document details page with the expected error message if receivedDate day is an invalid value (${correspondenceCategory})`, async () => {
				expect(addDocumentsResponse.statusCode).toBe(302);

				const testCases = [
					{ value: '', expectedError: 'Received date must include a day' },
					{ value: 'a', expectedError: 'Received date day must be a number' },
					{ value: '0', expectedError: 'Received date day must be between 1 and 31' },
					{ value: '32', expectedError: 'Received date day must be between 1 and 31' }
				];

				for (const testCase of testCases) {
					const response = await request
						.post(
							`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/add-document-details/${folder.folderId}/1`
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
					expect(unprettifiedElement.innerHTML).toContain(
						`${
							correspondenceCategory === 'cross-team' ? 'Cross-team' : 'Inspector'
						} correspondence</h1>`
					);

					const errorSummaryElement = parseHtml(response.text, {
						rootElement: '.govuk-error-summary'
					});

					expect(errorSummaryElement.innerHTML).toContain(testCase.expectedError);
				}
			});

			it(`should re-render the document details page with the expected error message if receivedDate month is an invalid value (${correspondenceCategory})`, async () => {
				expect(addDocumentsResponse.statusCode).toBe(302);

				const testCases = [
					{ value: '', expectedError: 'Received date must include a month' },
					{ value: 'a', expectedError: 'Received date month must be a number' },
					{ value: '0', expectedError: 'Received date month must be between 1 and 12' },
					{ value: '13', expectedError: 'Received date month must be between 1 and 12' }
				];

				for (const testCase of testCases) {
					const response = await request
						.post(
							`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/add-document-details/${folder.folderId}/1`
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
					expect(unprettifiedElement.innerHTML).toContain(
						`${
							correspondenceCategory === 'cross-team' ? 'Cross-team' : 'Inspector'
						} correspondence</h1>`
					);

					const errorSummaryElement = parseHtml(response.text, {
						rootElement: '.govuk-error-summary'
					});

					expect(errorSummaryElement.innerHTML).toContain(testCase.expectedError);
				}
			});

			it(`should re-render the document details page with the expected error message if receivedDate year is an invalid value (${correspondenceCategory})`, async () => {
				expect(addDocumentsResponse.statusCode).toBe(302);

				const testCases = [
					{ value: '', expectedError: 'Received date must include a year' },
					{ value: 'a', expectedError: 'Received date year must be a number' },
					{ value: '202', expectedError: 'Received date year must be 4 digits' }
				];

				for (const testCase of testCases) {
					const response = await request
						.post(
							`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/add-document-details/${folder.folderId}/1`
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
					expect(unprettifiedElement.innerHTML).toContain(
						`${
							correspondenceCategory === 'cross-team' ? 'Cross-team' : 'Inspector'
						} correspondence</h1>`
					);

					const errorSummaryElement = parseHtml(response.text, {
						rootElement: '.govuk-error-summary'
					});

					expect(errorSummaryElement.innerHTML).toContain(testCase.expectedError);
				}
			});

			it(`should re-render the document details page with the expected error message if receivedDate is not a valid date (${correspondenceCategory})`, async () => {
				expect(addDocumentsResponse.statusCode).toBe(302);

				const response = await request
					.post(
						`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/add-document-details/${folder.folderId}/1`
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
				expect(unprettifiedElement.innerHTML).toContain(
					`${
						correspondenceCategory === 'cross-team' ? 'Cross-team' : 'Inspector'
					} correspondence</h1>`
				);

				const errorSummaryElement = parseHtml(response.text, {
					rootElement: '.govuk-error-summary'
				});

				expect(errorSummaryElement.innerHTML).toContain('Received date must be a valid date');
			});

			it(`should send a patch request to the appeal documents endpoint and redirect to the check and confirm page, if complete and valid document details were provided (${correspondenceCategory})`, async () => {
				expect(addDocumentsResponse.statusCode).toBe(302);

				const response = await request
					.post(
						`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/add-document-details/${folder.folderId}/1`
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
					`Found. Redirecting to /appeals-service/appeal-details/1/internal-correspondence/${correspondenceCategory}/check-your-answers/${folder.folderId}/1`
				);
			});
		}
	});

	describe('GET /internal-correspondence/:correspondenceCategory/check-your-answers/:folderId', () => {
		const correspondenceCategories = ['cross-team', 'inspector'];

		beforeEach(async () => {
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses)
				.persist();
			nock('http://test/')
				.get('/appeals/1/document-folders/10')
				.reply(200, folderInfoCrossTeamCorrespondence)
				.persist();
			nock('http://test/')
				.get('/appeals/1/document-folders/11')
				.reply(200, folderInfoInspectorCorrespondence)
				.persist();
		});
		afterEach(() => {
			nock.cleanAll();
		});

		for (const correspondenceCategory of correspondenceCategories) {
			const folder =
				// @ts-ignore
				appealData.internalCorrespondence[
					`${correspondenceCategory === 'cross-team' ? 'crossTeam' : correspondenceCategory}`
				];

			it(`should render a 500 error page if fileUploadInfo is not present in the session (${correspondenceCategory})`, async () => {
				const response = await request.get(
					`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/check-your-answers/${folder.folderId}`
				);

				expect(response.statusCode).toBe(500);
				const element = parseHtml(response.text);
				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain(
					'Sorry, there is a problem with the service</h1>'
				);
			});

			it(`should render the add documents check and confirm page with summary list row displaying info on the uploaded document (${correspondenceCategory})`, async () => {
				const addDocumentsResponse = await request
					.post(
						`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/upload-documents/${folder.folderId}`
					)
					.send({
						'upload-info': fileUploadInfo
					});

				expect(addDocumentsResponse.statusCode).toBe(302);

				const response = await request.get(
					`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/check-your-answers/${folder.folderId}`
				);

				expect(response.statusCode).toBe(200);

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Check your answers</h1>');
				expect(unprettifiedElement.innerHTML).toContain('File</dt>');
				expect(unprettifiedElement.innerHTML).toContain(
					'<a class="govuk-link" href="/documents/APP/Q9999/D/21/351062/download-uncommitted/1/test-document.txt" target="_blank">test-document.txt</a></dd>'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					`href="/appeals-service/appeal-details/1/internal-correspondence/${correspondenceCategory}/upload-documents/${folder.folderId}">Change<span class="govuk-visually-hidden"> file test-document.txt</span></a></dd>`
				);
				expect(unprettifiedElement.innerHTML).toContain('Date received</dt>');
				expect(unprettifiedElement.innerHTML).toContain(
					`${dateISOStringToDisplayDate(new Date().toISOString())}</dd>`
				);
				expect(unprettifiedElement.innerHTML).toContain(
					`href="/appeals-service/appeal-details/1/internal-correspondence/${correspondenceCategory}/add-document-details/${folder.folderId}">Change<span class="govuk-visually-hidden"> test-document.txt date received</span></a></dd>`
				);
				expect(unprettifiedElement.innerHTML).toContain('Redaction status</dt>');
				expect(unprettifiedElement.innerHTML).toContain('No redaction required</dd>');
				expect(unprettifiedElement.innerHTML).toContain('Confirm</button>');
			});
		}
	});

	describe('POST /internal-correspondence/:correspondenceCategory/check-your-answers/:folderId', () => {
		const correspondenceCategories = ['cross-team', 'inspector'];

		beforeEach(async () => {
			nock.cleanAll();
			nock('http://test/').get('/appeals/1').reply(200, appealData).persist();
			nock('http://test/')
				.get('/appeals/1/document-folders/10')
				.reply(200, folderInfoCrossTeamCorrespondence)
				.persist();
			nock('http://test/')
				.get('/appeals/1/document-folders/11')
				.reply(200, folderInfoInspectorCorrespondence)
				.persist();
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses)
				.persist();
		});
		afterEach(() => {
			nock.cleanAll();
		});

		for (const correspondenceCategory of correspondenceCategories) {
			const folder =
				// @ts-ignore
				appealData.internalCorrespondence[
					`${correspondenceCategory === 'cross-team' ? 'crossTeam' : correspondenceCategory}`
				];

			it('should render a 500 error page if fileUploadInfo is not present in the session', async () => {
				const response = await request
					.post(
						`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/check-your-answers/${folder.folderId}`
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

			it('should send an API request to create a new document and redirect to the appeal details page', async () => {
				const mockDocumentsEndpoint = nock('http://test/').post('/appeals/1/documents').reply(200);
				const addDocumentsResponse = await request
					.post(
						`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/upload-documents/${folder.folderId}`
					)
					.send({
						'upload-info': fileUploadInfo
					});

				expect(addDocumentsResponse.statusCode).toBe(302);

				const response = await request
					.post(
						`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/check-your-answers/${folder.folderId}`
					)
					.send({});

				expect(response.statusCode).toBe(302);
				expect(response.text).toBe('Found. Redirecting to /appeals-service/appeal-details/1');
				expect(mockDocumentsEndpoint.isDone()).toBe(true);
			});
		}
	});

	describe('GET /internal-correspondence/:correspondenceCategory/check-your-answers/:folderId/:documentId', () => {
		const correspondenceCategories = ['cross-team', 'inspector'];

		beforeEach(async () => {
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses)
				.persist();
			nock('http://test/')
				.get('/appeals/1/document-folders/10')
				.reply(200, folderInfoCrossTeamCorrespondence)
				.persist();
			nock('http://test/')
				.get('/appeals/1/document-folders/11')
				.reply(200, folderInfoInspectorCorrespondence)
				.persist();
			nock('http://test/').get('/appeals/1/documents/1').reply(200, documentFileInfo);
		});
		afterEach(() => {
			nock.cleanAll();
		});

		for (const correspondenceCategory of correspondenceCategories) {
			const folder =
				// @ts-ignore
				appealData.internalCorrespondence[
					`${correspondenceCategory === 'cross-team' ? 'crossTeam' : correspondenceCategory}`
				];

			it(`should render a 500 error page if fileUploadInfo is not present in the session (${correspondenceCategory})`, async () => {
				const response = await request.get(
					`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/check-your-answers/${folder.folderId}/1`
				);

				expect(response.statusCode).toBe(500);
				const element = parseHtml(response.text);
				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain(
					'Sorry, there is a problem with the service</h1>'
				);
			});

			it(`should render the add documents check and confirm page with summary list row displaying info on the uploaded document (${correspondenceCategory})`, async () => {
				const addDocumentsResponse = await request
					.post(
						`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/upload-documents/${folder.folderId}/1`
					)
					.send({
						'upload-info': fileUploadInfo
					});

				expect(addDocumentsResponse.statusCode).toBe(302);

				const response = await request.get(
					`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/check-your-answers/${folder.folderId}/1`
				);

				expect(response.statusCode).toBe(200);

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Check your answers</h1>');
				expect(unprettifiedElement.innerHTML).toContain('File</dt>');
				expect(unprettifiedElement.innerHTML).toContain(
					'<a class="govuk-link" href="/documents/APP/Q9999/D/21/351062/download-uncommitted/1/ph0-documentFileInfo.jpeg/2" target="_blank">test-document.txt</a></dd>'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					`href="/appeals-service/appeal-details/1/internal-correspondence/${correspondenceCategory}/upload-documents/${folder.folderId}/1">Change<span class="govuk-visually-hidden"> file test-document.txt</span></a></dd>`
				);
				expect(unprettifiedElement.innerHTML).toContain('Date received</dt>');
				expect(unprettifiedElement.innerHTML).toContain(
					`${dateISOStringToDisplayDate(new Date().toISOString())}</dd>`
				);
				expect(unprettifiedElement.innerHTML).toContain(
					`href="/appeals-service/appeal-details/1/internal-correspondence/${correspondenceCategory}/add-document-details/${folder.folderId}/1">Change<span class="govuk-visually-hidden"> test-document.txt date received</span></a></dd>`
				);
				expect(unprettifiedElement.innerHTML).toContain('Redaction status</dt>');
				expect(unprettifiedElement.innerHTML).toContain('No redaction required</dd>');
				expect(unprettifiedElement.innerHTML).toContain('Confirm</button>');
			});
		}
	});

	describe('POST /internal-correspondence/:correspondenceCategory/check-your-answers/:folderId/:documentId', () => {
		const correspondenceCategories = ['cross-team', 'inspector'];

		beforeEach(async () => {
			nock.cleanAll();
			nock('http://test/').get('/appeals/1').reply(200, appealData).persist();
			nock('http://test/')
				.get('/appeals/1/document-folders/10')
				.reply(200, folderInfoCrossTeamCorrespondence)
				.persist();
			nock('http://test/')
				.get('/appeals/1/document-folders/11')
				.reply(200, folderInfoInspectorCorrespondence)
				.persist();
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses)
				.persist();
			nock('http://test/').get('/appeals/1/documents/1').reply(200, documentFileInfo);
		});
		afterEach(() => {
			nock.cleanAll();
		});

		for (const correspondenceCategory of correspondenceCategories) {
			const folder =
				// @ts-ignore
				appealData.internalCorrespondence[
					`${correspondenceCategory === 'cross-team' ? 'crossTeam' : correspondenceCategory}`
				];

			it('should render a 500 error page if fileUploadInfo is not present in the session', async () => {
				const response = await request
					.post(
						`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/check-your-answers/${folder.folderId}/1`
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

			it('should send an API request to create a new document and redirect to the appeal details page', async () => {
				const mockDocumentsEndpoint = nock('http://test/')
					.post('/appeals/1/documents/1')
					.reply(200);
				const addDocumentsResponse = await request
					.post(
						`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/upload-documents/${folder.folderId}/1`
					)
					.send({
						'upload-info': fileUploadInfo
					});

				expect(addDocumentsResponse.statusCode).toBe(302);

				const response = await request
					.post(
						`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/check-your-answers/${folder.folderId}/1`
					)
					.send({});

				expect(response.statusCode).toBe(302);
				expect(response.text).toBe('Found. Redirecting to /appeals-service/appeal-details/1');
				expect(mockDocumentsEndpoint.isDone()).toBe(true);
			});
		}
	});

	describe('GET /internal-correspondence/:correspondenceCategory/manage-documents/:folderId/', () => {
		const correspondenceCategories = ['cross-team', 'inspector'];

		beforeEach(() => {
			// @ts-ignore
			usersService.getUserByRoleAndId = jest.fn().mockResolvedValue(activeDirectoryUsersData[0]);
			nock('http://test/')
				.get('/appeals/1/document-folders/10')
				.reply(200, folderInfoCrossTeamCorrespondence)
				.persist();
			nock('http://test/')
				.get('/appeals/1/document-folders/11')
				.reply(200, folderInfoInspectorCorrespondence)
				.persist();
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses)
				.persist();
		});
		afterEach(() => {
			nock.cleanAll();
		});

		for (const correspondenceCategory of correspondenceCategories) {
			const folder =
				// @ts-ignore
				appealData.internalCorrespondence[
					`${correspondenceCategory === 'cross-team' ? 'crossTeam' : correspondenceCategory}`
				];

			it(`should render a 404 error page if the folderId is not valid (${correspondenceCategory})`, async () => {
				const response = await request.get(
					`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/manage-documents/99`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();
				expect(element.innerHTML).toContain('Page not found</h1>');
			});

			it(`should render the manage folder page with one document item for each document present in the folder if the folderId is valid (${correspondenceCategory})`, async () => {
				const response = await request.get(
					`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/manage-documents/${folder.folderId}`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Manage folder</span><h1');
				expect(unprettifiedElement.innerHTML).toContain(
					`${
						correspondenceCategory === 'cross-team' ? 'Cross-team' : 'Inspector'
					} correspondence documents</h1>`
				);
			});
		}
	});

	describe('GET /internal-correspondence/:correspondenceCategory/manage-documents/:folderId/:documentId', () => {
		const correspondenceCategories = ['cross-team', 'inspector'];

		beforeEach(() => {
			// @ts-ignore
			usersService.getUsersByRole = jest.fn().mockResolvedValue(activeDirectoryUsersData);
			// @ts-ignore
			usersService.getUserByRoleAndId = jest.fn().mockResolvedValue(activeDirectoryUsersData[0]);
			// @ts-ignore
			usersService.getUserById = jest.fn().mockResolvedValue(activeDirectoryUsersData[0]);

			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses);
			nock('http://test/')
				.get('/appeals/1/document-folders/10')
				.reply(200, folderInfoCrossTeamCorrespondence)
				.persist();
			nock('http://test/')
				.get('/appeals/1/document-folders/11')
				.reply(200, folderInfoInspectorCorrespondence)
				.persist();
			nock('http://test/').get('/appeals/1/documents/1').reply(200, documentFileInfo);
		});

		for (const correspondenceCategory of correspondenceCategories) {
			const folder =
				// @ts-ignore
				appealData.internalCorrespondence[
					`${correspondenceCategory === 'cross-team' ? 'crossTeam' : correspondenceCategory}`
				];

			it(`should render a 404 error page if the folderId is not valid (${correspondenceCategory})`, async () => {
				nock('http://test/')
					.get('/appeals/1/documents/1/versions')
					.reply(200, documentFileVersionsInfo);

				const response = await request.get(
					`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/manage-documents/99/1`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const h1Element = parseHtml(response.text, { rootElement: 'h1' });

				expect(h1Element.innerHTML).toContain('Page not found');
			});

			it(`should render a 404 error page if the documentId is not valid (${correspondenceCategory})`, async () => {
				nock('http://test/')
					.get('/appeals/1/documents/1/versions')
					.reply(200, documentFileVersionsInfo);

				const response = await request.get(
					`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/manage-documents/${folder.folderId}/99`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const h1Element = parseHtml(response.text, { rootElement: 'h1' });

				expect(h1Element.innerHTML).toContain('Page not found');
			});

			it(`should render the manage individual document page with the expected content if the folderId and documentId are both valid and the document virus check status is null (${correspondenceCategory})`, async () => {
				nock('http://test/')
					.get('/appeals/1/documents/1/versions')
					.reply(200, documentFileVersionsInfo);

				const response = await request.get(
					`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/manage-documents/${folder.folderId}/1`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain(
					'test-pdf-documentFileVersionsInfo.pdf</h1>'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'<strong class="govuk-tag govuk-tag--yellow single-line">Virus scanning</strong>'
				);
				expect(unprettifiedElement.innerHTML).not.toContain('Upload a new version');
				expect(unprettifiedElement.innerHTML).not.toContain('Remove current version');
			});

			it(`should render the manage individual document page with the expected content if the folderId and documentId are both valid and the document virus check status is "not_scanned" (${correspondenceCategory})`, async () => {
				nock('http://test/')
					.get('/appeals/1/documents/1/versions')
					.reply(200, documentFileVersionsInfoNotChecked);

				const response = await request.get(
					`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/manage-documents/${folder.folderId}/1`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain(
					'test-pdf-documentFileVersionsInfo.pdf</h1>'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'<strong class="govuk-tag govuk-tag--yellow single-line">Virus scanning</strong>'
				);
				expect(unprettifiedElement.innerHTML).not.toContain('Upload a new version');
				expect(unprettifiedElement.innerHTML).not.toContain('Remove current version');
			});

			it(`should render the manage individual document page with the expected content if the folderId and documentId are both valid and the document virus check status is "affected" (${correspondenceCategory})`, async () => {
				nock('http://test/')
					.get('/appeals/1/documents/1/versions')
					.reply(200, documentFileVersionsInfoVirusFound);

				const response = await request.get(
					`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/manage-documents/${folder.folderId}/1`
				);

				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain(
					'test-pdf-documentFileVersionsInfo.pdf</h1>'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'<strong class="govuk-tag govuk-tag--red single-line">Virus detected</strong>'
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

			it(`should render the manage individual document page with the expected content if the folderId and documentId are both valid and the document virus check status is "scanned" (${correspondenceCategory})`, async () => {
				nock('http://test/')
					.get('/appeals/1/documents/1/versions')
					.reply(200, documentFileVersionsInfoChecked);

				const response = await request.get(
					`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/manage-documents/${folder.folderId}/1`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain(
					'test-pdf-documentFileVersionsInfo.pdf</h1>'
				);
				expect(unprettifiedElement.innerHTML).not.toContain(
					'<strong class="govuk-tag govuk-tag--yellow single-line">Virus scanning</strong>'
				);
				expect(unprettifiedElement.innerHTML).not.toContain(
					'<strong class="govuk-tag govuk-tag--red single-line">Virus detected</strong>'
				);
				expect(unprettifiedElement.innerHTML).toContain('Upload a new version');
				expect(unprettifiedElement.innerHTML).toContain('Remove current version');
			});
		}
	});

	describe('GET /internal-correspondence/:correspondenceCategory/change-document-details/:folderId/:documentId', () => {
		const correspondenceCategories = ['cross-team', 'inspector'];

		beforeEach(async () => {
			nock('http://test/')
				.get('/appeals/1/document-folders/10')
				.reply(200, folderInfoCrossTeamCorrespondence)
				.persist();
			nock('http://test/')
				.get('/appeals/1/document-folders/11')
				.reply(200, folderInfoInspectorCorrespondence)
				.persist();
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses)
				.persist();
			nock('http://test/').get('/appeals/1/documents/1').reply(200, documentFileInfo);
		});

		for (const correspondenceCategory of correspondenceCategories) {
			const folder =
				// @ts-ignore
				appealData.internalCorrespondence[
					`${correspondenceCategory === 'cross-team' ? 'crossTeam' : correspondenceCategory}`
				];

			it(`should render the change document details page with one set of fields for the document being changed (${correspondenceCategory})`, async () => {
				const response = await request.get(
					`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/change-document-details/${folder.folderId}/1`
				);

				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Change document details</span><h1');
				expect(unprettifiedElement.innerHTML).toContain(
					`${
						correspondenceCategory === 'cross-team' ? 'Cross team' : 'Inspector'
					} correspondence documents</h1>`
				);
				expect(unprettifiedElement.innerHTML).toContain('ph0-documentFileInfo.jpeg</h2>');
				expect(unprettifiedElement.innerHTML).toContain('Date received</legend>');
				expect(unprettifiedElement.innerHTML).toContain(
					'name="items[0][receivedDate]-[day]" type="text" value="11" inputmode="numeric">'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'name="items[0][receivedDate]-[month]" type="text" value="10" inputmode="numeric">'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'name="items[0][receivedDate]-[year]" type="text" value="2023" inputmode="numeric">'
				);
				expect(unprettifiedElement.innerHTML).toContain('Redaction status</legend>');
				expect(unprettifiedElement.innerHTML).toContain(
					'name="items[0][redactionStatus]" type="radio" value="redacted">'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'name="items[0][redactionStatus]" type="radio" value="unredacted">'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'name="items[0][redactionStatus]" type="radio" value="no redaction required" checked=null>'
				);
				expect(unprettifiedElement.innerHTML).toContain('Confirm</button>');
			});

			it(`should render a back link to the manage individual document page (${correspondenceCategory})`, async () => {
				const response = await request.get(
					`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/change-document-details/${folder.folderId}/1`
				);

				const unprettifiedElement = parseHtml(response.text, {
					rootElement: '.govuk-back-link',
					skipPrettyPrint: true
				});

				expect(unprettifiedElement.innerHTML).toContain(
					`href="/appeals-service/appeal-details/1/internal-correspondence/${correspondenceCategory}/manage-documents/${folder.folderId}/1"`
				);
			});
		}
	});

	describe('POST /internal-correspondence/:correspondenceCategory/change-document-details/:folderId/:documentId', () => {
		const correspondenceCategories = ['cross-team', 'inspector'];

		beforeEach(async () => {
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses)
				.persist();
			nock('http://test/')
				.get('/appeals/1/document-folders/10')
				.reply(200, folderInfoCrossTeamCorrespondence)
				.persist();
			nock('http://test/')
				.get('/appeals/1/document-folders/11')
				.reply(200, folderInfoInspectorCorrespondence)
				.persist();
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
			nock('http://test/').get('/appeals/1/documents/1').reply(200, documentFileInfo).persist();
		});

		afterEach(() => {
			nock.cleanAll();
		});

		for (const correspondenceCategory of correspondenceCategories) {
			const folder =
				// @ts-ignore
				appealData.internalCorrespondence[
					`${correspondenceCategory === 'cross-team' ? 'crossTeam' : correspondenceCategory}`
				];

			it(`should re-render the change document details page with the expected error message if the request body is in an incorrect format (${correspondenceCategory})`, async () => {
				const response = await request
					.post(
						`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/change-document-details/${folder.folderId}/1`
					)
					.send({});

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Change document details</span><h1');
				expect(unprettifiedElement.innerHTML).toContain(
					`${
						correspondenceCategory === 'cross-team' ? 'Cross team' : 'Inspector'
					} correspondence documents</h1>`
				);

				const errorSummaryElement = parseHtml(response.text, {
					rootElement: '.govuk-error-summary'
				});

				expect(errorSummaryElement.innerHTML).toContain('There is a problem with the service');
			});

			it(`should re-render the change document details page with the expected error message if receivedDate day is an invalid value (${correspondenceCategory})`, async () => {
				const testCases = [
					{ value: '', expectedError: 'Received date must include a day' },
					{ value: 'a', expectedError: 'Received date day must be a number' },
					{ value: '0', expectedError: 'Received date day must be between 1 and 31' },
					{ value: '32', expectedError: 'Received date day must be between 1 and 31' }
				];

				for (const testCase of testCases) {
					const response = await request
						.post(
							`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/change-document-details/${folder.folderId}/1`
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

					expect(unprettifiedElement.innerHTML).toContain('Change document details</span><h1');
					expect(unprettifiedElement.innerHTML).toContain(
						`${
							correspondenceCategory === 'cross-team' ? 'Cross team' : 'Inspector'
						} correspondence documents</h1>`
					);

					const errorSummaryElement = parseHtml(response.text, {
						rootElement: '.govuk-error-summary'
					});

					expect(errorSummaryElement.innerHTML).toContain(testCase.expectedError);
				}
			});

			it(`should re-render the change document details page with the expected error message if receivedDate month is an invalid value (${correspondenceCategory})`, async () => {
				const testCases = [
					{ value: '', expectedError: 'Received date must include a month' },
					{ value: 'a', expectedError: 'Received date month must be a number' },
					{ value: '0', expectedError: 'Received date month must be between 1 and 12' },
					{ value: '13', expectedError: 'Received date month must be between 1 and 12' }
				];

				for (const testCase of testCases) {
					const response = await request
						.post(
							`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/change-document-details/${folder.folderId}/1`
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

					expect(unprettifiedElement.innerHTML).toContain('Change document details</span><h1');
					expect(unprettifiedElement.innerHTML).toContain(
						`${
							correspondenceCategory === 'cross-team' ? 'Cross team' : 'Inspector'
						} correspondence documents</h1>`
					);

					const errorSummaryElement = parseHtml(response.text, {
						rootElement: '.govuk-error-summary'
					});

					expect(errorSummaryElement.innerHTML).toContain(testCase.expectedError);
				}
			});

			it(`should re-render the change document details page with the expected error message if receivedDate year is an invalid value (${correspondenceCategory})`, async () => {
				const testCases = [
					{ value: '', expectedError: 'Received date must include a year' },
					{ value: 'a', expectedError: 'Received date year must be a number' },
					{ value: '202', expectedError: 'Received date year must be 4 digits' }
				];

				for (const testCase of testCases) {
					const response = await request
						.post(
							`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/change-document-details/${folder.folderId}/1`
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

					expect(unprettifiedElement.innerHTML).toContain('Change document details</span><h1');
					expect(unprettifiedElement.innerHTML).toContain(
						`${
							correspondenceCategory === 'cross-team' ? 'Cross team' : 'Inspector'
						} correspondence documents</h1>`
					);

					const errorSummaryElement = parseHtml(response.text, {
						rootElement: '.govuk-error-summary'
					});

					expect(errorSummaryElement.innerHTML).toContain(testCase.expectedError);
				}
			});

			it(`should re-render the change document details page with the expected error message if receivedDate is not a valid date (${correspondenceCategory})`, async () => {
				const response = await request
					.post(
						`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/change-document-details/${folder.folderId}/1`
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

				expect(unprettifiedElement.innerHTML).toContain('Change document details</span><h1');
				expect(unprettifiedElement.innerHTML).toContain(
					`${
						correspondenceCategory === 'cross-team' ? 'Cross team' : 'Inspector'
					} correspondence documents</h1>`
				);

				const errorSummaryElement = parseHtml(response.text, {
					rootElement: '.govuk-error-summary'
				});

				expect(errorSummaryElement.innerHTML).toContain('Received date must be a valid date');
			});

			it(`should send a patch request to the appeal documents endpoint and redirect to the manage individual document page, if complete and valid document details were provided (${correspondenceCategory})`, async () => {
				const response = await request
					.post(
						`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/change-document-details/${folder.folderId}/1`
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
								redactionStatus: 'unredacted'
							}
						]
					});

				expect(response.statusCode).toBe(302);
				expect(response.text).toEqual(
					`Found. Redirecting to /appeals-service/appeal-details/1/internal-correspondence/${correspondenceCategory}/manage-documents/${folder.folderId}/1`
				);
			});
		}
	});

	describe('GET /internal-correspondence/:correspondenceCategory/change-document-name/:folderId/:documentId', () => {
		beforeEach(() => {
			nock('http://test/').get('/appeals/1/document-folders/10').reply(200, documentFolderInfo);
			nock('http://test/').get('/appeals/1/document-folders/11').reply(200, documentFolderInfo);
			nock('http://test/').get('/appeals/1/documents/1').reply(200, documentFileInfo);
		});

		const correspondenceCategories = ['cross-team', 'inspector'];
		for (const correspondenceCategory of correspondenceCategories) {
			const folder =
				// @ts-ignore
				appealData.internalCorrespondence[
					`${correspondenceCategory === 'cross-team' ? 'crossTeam' : correspondenceCategory}`
				];

			it(`should render the change document name page for the document being changed (${correspondenceCategory})`, async () => {
				const response = await request.get(
					`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/change-document-name/${folder.folderId}/1`
				);

				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Change document details</span><h1');
				expect(unprettifiedElement.innerHTML).toContain('File name');
				expect(unprettifiedElement.innerHTML).toContain('value="ph0-documentFileInfo.jpeg">');
			});
		}
	});

	describe('POST /internal-correspondence/:correspondenceCategory/change-document-name/:folderId/:documentId', () => {
		beforeEach(() => {
			nock('http://test/').get('/appeals/document-redaction-statuses').reply(200, []);
			nock('http://test/').patch('/appeals/1/documents/1').reply(200, {});
			nock('http://test/').get('/appeals/1/document-folders/10').reply(200, documentFolderInfo);
			nock('http://test/').get('/appeals/1/document-folders/11').reply(200, documentFolderInfo);
			nock('http://test/').get('/appeals/1/documents/1').reply(200, documentFileInfo);
		});

		const correspondenceCategories = ['cross-team', 'inspector'];

		for (const correspondenceCategory of correspondenceCategories) {
			const folder =
				// @ts-ignore
				appealData.internalCorrespondence[
					`${correspondenceCategory === 'cross-team' ? 'crossTeam' : correspondenceCategory}`
				];

			it(`should send a patch request to the appeal documents endpoint and redirect to the manage individual document page, if a new valid document name is provided (${correspondenceCategory})`, async () => {
				const fullUrl = `/appeals-service/appeal-details/1/internal-correspondence/${correspondenceCategory}/change-document-name/${folder.folderId}/1`;
				const response = await request
					.post(
						`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/change-document-name/${folder.folderId}/1`
					)
					.send({ fileName: 'new-name.jpeg', documentId: '1' });

				expect(response.statusCode).toBe(302);
				expect(response.text).toContain(
					`Found. Redirecting to ${fullUrl.replace('change-document-name', 'manage-documents')}`
				);
			});
		}
	});

	describe('GET /internal-correspondence/:correspondenceCategory/manage-documents/:folderId/:documentId/:versionId/delete', () => {
		const correspondenceCategories = ['cross-team', 'inspector'];

		beforeEach(() => {
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses);
			nock('http://test/')
				.get('/appeals/1/document-folders/10')
				.reply(200, folderInfoCrossTeamCorrespondence)
				.persist();
			nock('http://test/')
				.get('/appeals/1/document-folders/11')
				.reply(200, folderInfoInspectorCorrespondence)
				.persist();
			nock('http://test/').get('/appeals/1/documents/1').reply(200, documentFileInfo);
		});

		for (const correspondenceCategory of correspondenceCategories) {
			const folder =
				// @ts-ignore
				appealData.internalCorrespondence[
					`${correspondenceCategory === 'cross-team' ? 'crossTeam' : correspondenceCategory}`
				];

			it(`should render the delete document page with the expected content when there is a single document version (${correspondenceCategory})`, async () => {
				nock('http://test/')
					.get('/appeals/1/documents/1/versions')
					.reply(200, documentFileVersionsInfoChecked);

				const response = await request.get(
					`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/manage-documents/${folder.folderId}/1/1/delete`
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

			it(`should render the delete document page with the expected content when there are multiple document versions (${correspondenceCategory})`, async () => {
				const multipleVersionsDocument = cloneDeep(documentFileVersionsInfoChecked);
				multipleVersionsDocument.allVersions.push(multipleVersionsDocument.allVersions[0]);

				nock('http://test/')
					.get('/appeals/1/documents/1/versions')
					.reply(200, multipleVersionsDocument);

				const response = await request.get(
					`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/manage-documents/${folder.folderId}/1/1/delete`
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
	});

	describe('POST /internal-correspondence/:correspondenceCategory/manage-documents/:folderId/:documentId/:versionId/delete', () => {
		const correspondenceCategories = ['cross-team', 'inspector'];

		beforeEach(() => {
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses);
			nock('http://test/')
				.get('/appeals/1/document-folders/10')
				.reply(200, folderInfoCrossTeamCorrespondence)
				.persist();
			nock('http://test/')
				.get('/appeals/1/document-folders/11')
				.reply(200, folderInfoInspectorCorrespondence)
				.persist();
			nock('http://test/').get('/appeals/1/documents/1').reply(200, documentFileInfo);
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

		for (const correspondenceCategory of correspondenceCategories) {
			const folder =
				// @ts-ignore
				appealData.internalCorrespondence[
					`${correspondenceCategory === 'cross-team' ? 'crossTeam' : correspondenceCategory}`
				];

			it(`should re-render the delete document page with the expected error message if answer was not provided (${correspondenceCategory})`, async () => {
				nock('http://test/')
					.get('/appeals/1/documents/1/versions')
					.reply(200, documentFileVersionsInfo);

				const response = await request
					.post(
						`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/manage-documents/${folder.folderId}/1/1/delete`
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

				expect(errorSummaryElement.innerHTML).toContain('Answer must be provided');
			});

			it(`should not send an API request to delete the document, and should redirect to the manage document page, if answer "no" was provided`, async () => {
				nock('http://test/')
					.get('/appeals/1/documents/1/versions')
					.reply(200, documentFileVersionsInfo);

				const response = await request
					.post(
						`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/manage-documents/${folder.folderId}/1/1/delete`
					)
					.send({
						'delete-file-answer': 'no'
					});

				expect(response.statusCode).toBe(302);
				expect(response.text).toContain('Found. Redirecting to ');
				expect(response.text).toContain(
					`/appeals-service/appeal-details/1/internal-correspondence/${correspondenceCategory}/manage-documents/${folder.folderId}/1`
				);
			});

			it(`should send an API request to delete the document, and redirect to the case details page, if answer "yes" was provided`, async () => {
				nock('http://test/')
					.get('/appeals/1/documents/1/versions')
					.reply(200, documentFileVersionsInfo);

				const response = await request
					.post(
						`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/manage-documents/${folder.folderId}/1/1/delete`
					)
					.send({
						'delete-file-answer': 'yes'
					});

				expect(response.statusCode).toBe(302);
				expect(response.text).toContain('Found. Redirecting to ');
				expect(response.text).toContain('/appeals-service/appeal-details/1');
			});
		}
	});
});
