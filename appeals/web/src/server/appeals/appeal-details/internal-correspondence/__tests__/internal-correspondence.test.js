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
	documentFolderInfo,
	documentRedactionStatuses,
	fileUploadInfo,
	folderInfoCrossTeamCorrespondence,
	folderInfoInspectorCorrespondence,
	folderInfoMainPartyCorrespondence
} from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { jest } from '@jest/globals';
import { parseHtml } from '@pins/platform';
import { capitalize } from 'lodash-es';
import nock from 'nock';
import supertest from 'supertest';
import { documentNameFromCategory } from '../internal-correspondence.service';
const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';

describe('internal correspondence', () => {
	afterAll(() => {
		nock.cleanAll();
		nock.restore();
		jest.clearAllMocks();
	});
	beforeEach(installMockApi);
	afterEach(teardown);

	/**
	 * Helper method to get the folder based on the correspondence category.
	 * @param {string} correspondenceCategory
	 * @returns {Object} The folder object for the given correspondence category.
	 */
	const getFolder = (correspondenceCategory) => {
		const internalCorrespondenceCategory = () => {
			switch (correspondenceCategory) {
				case 'cross-team':
					return 'crossTeam';
				case 'main-party':
					return 'mainParty';
				default:
					return correspondenceCategory;
			}
		};
		// @ts-ignore
		return appealData.internalCorrespondence[internalCorrespondenceCategory()];
	};

	/**
	 * Helper method to get the title based on the correspondence category.
	 * @param {string} correspondenceCategory
	 * @returns {string}
	 */
	const convertToTitle = (correspondenceCategory) => {
		switch (correspondenceCategory) {
			case 'cross-team':
				return 'Cross-team';
			case 'main-party':
				return 'Main party';
			default:
				return 'Inspector';
		}
	};

	/**
	 * @param {string} correspondenceCategory
	 * @returns {string}
	 */
	const convertToTitleForChangePage = (correspondenceCategory) => {
		let nameText = (correspondenceCategory.split('/')?.[1] || '')
			.replace(/(?<!^)([A-Z])/g, ' $1')
			.toLowerCase();
		nameText = nameText.trim();
		return capitalize(nameText);
	};

	const correspondenceCategories = ['cross-team', 'inspector', 'main-party'];

	describe('GET /internal-correspondence/:correspondenceCategory/upload-documents/:folderId', () => {
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
				.get('/appeals/1/document-folders/22')
				.reply(200, folderInfoMainPartyCorrespondence)
				.persist();
		});

		for (const correspondenceCategory of correspondenceCategories) {
			const folder = getFolder(correspondenceCategory);

			it(`should render the upload documents page (${correspondenceCategory})`, async () => {
				const response = await request.get(
					// @ts-ignore
					`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/upload-documents/${folder.folderId}`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain(
					`Upload ${
						correspondenceCategory === 'main-party' ? 'main party' : correspondenceCategory
					} correspondence</h1>`
				);

				expect(unprettifiedElement.innerHTML).toContain(
					'<div class="govuk-grid-row pins-file-upload"'
				);
				expect(unprettifiedElement.innerHTML).toContain('Choose files</button>');
			});
		}
	});

	describe('POST /internal-correspondence/:correspondenceCategory/upload-documents/:folderId', () => {
		beforeEach(() => {
			nock.cleanAll();
			nock('http://test/').get('/appeals/1?include=all').reply(200, appealData).persist();
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
			nock('http://test/')
				.get('/appeals/1/document-folders/22')
				.reply(200, folderInfoMainPartyCorrespondence)
				.persist();
		});
		afterEach(() => {
			nock.cleanAll();
		});

		for (const correspondenceCategory of correspondenceCategories) {
			const folder = getFolder(correspondenceCategory);

			it(`should render a 500 error page if upload-info is not present in the request body (${correspondenceCategory})`, async () => {
				const response = await request
					.post(
						// @ts-ignore
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
						// @ts-ignore
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

			it(`should redirect to the upload document details page if upload-info is present in the request body and in the correct format (${correspondenceCategory})`, async () => {
				const response = await request
					.post(
						// @ts-ignore
						`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/upload-documents/${folder.folderId}`
					)
					.send({
						'upload-info': fileUploadInfo
					});

				expect(response.statusCode).toBe(302);
				expect(response.text).toBe(
					// @ts-ignore
					`Found. Redirecting to /appeals-service/appeal-details/1/internal-correspondence/${correspondenceCategory}/add-document-details/${folder.folderId}`
				);
			});
		}
	});

	describe('GET /internal-correspondence/:correspondenceCategory/upload-documents/:folderId/:documentId', () => {
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
				.get('/appeals/1/document-folders/22')
				.reply(200, folderInfoMainPartyCorrespondence)
				.persist();
			nock('http://test/').get('/appeals/documents/1').reply(200, documentFileInfo);
			nock('http://test/')
				.get('/appeals/documents/1/versions')
				.reply(200, documentFileVersionsInfo);
		});

		for (const correspondenceCategory of correspondenceCategories) {
			const folder = getFolder(correspondenceCategory);

			it(`should render the upload document version page (${correspondenceCategory})`, async () => {
				const response = await request.get(
					// @ts-ignore
					`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/upload-documents/${folder.folderId}/1`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();
				expect(element.innerHTML).toContain('<div class="govuk-grid-row pins-file-upload"');
				expect(element.innerHTML).toContain('Choose file</button>');
			});
		}
	});

	describe('POST /internal-correspondence/:correspondenceCategory/upload-documents/:folderId/:documentId', () => {
		beforeEach(() => {
			nock.cleanAll();
			nock('http://test/').get('/appeals/1?include=all').reply(200, appealData).persist();
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
			nock('http://test/')
				.get('/appeals/1/document-folders/22')
				.reply(200, folderInfoMainPartyCorrespondence)
				.persist();
			nock('http://test/').get('/appeals/documents/1').reply(200, documentFileInfo);
		});
		afterEach(() => {
			nock.cleanAll();
		});

		for (const correspondenceCategory of correspondenceCategories) {
			const folder = getFolder(correspondenceCategory);

			it(`should render a 500 error page if upload-info is not present in the request body (${correspondenceCategory})`, async () => {
				const response = await request
					.post(
						// @ts-ignore
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
						// @ts-ignore
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

			it(`should redirect to the upload document details page if upload-info is present in the request body and in the correct format (${correspondenceCategory})`, async () => {
				const response = await request
					.post(
						// @ts-ignore
						`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/upload-documents/${folder.folderId}/1`
					)
					.send({
						'upload-info': fileUploadInfo
					});

				expect(response.statusCode).toBe(302);
				expect(response.text).toBe(
					// @ts-ignore
					`Found. Redirecting to /appeals-service/appeal-details/1/internal-correspondence/${correspondenceCategory}/add-document-details/${folder.folderId}/1`
				);
			});
		}
	});

	describe('GET /internal-correspondence/:correspondenceCategory/add-document-details/:folderId', () => {
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
				.get('/appeals/1/document-folders/22')
				.reply(200, folderInfoMainPartyCorrespondence)
				.persist();
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses)
				.persist();
		});

		for (const correspondenceCategory of correspondenceCategories) {
			const folder = getFolder(correspondenceCategory);

			it(`should render a 500 error page if fileUploadInfo is not present in the session (${correspondenceCategory})`, async () => {
				const response = await request.get(
					// @ts-ignore
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
						// @ts-ignore
						`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/upload-documents/${folder.folderId}`
					)
					.send({
						'upload-info': fileUploadInfo
					});

				expect(addDocumentsResponse.statusCode).toBe(302);
				expect(addDocumentsResponse.text).toContain(
					// @ts-ignore
					`Found. Redirecting to /appeals-service/appeal-details/1/internal-correspondence/${correspondenceCategory}/add-document-details/${folder.folderId}`
				);

				const response = await request.get(
					// @ts-ignore
					`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/add-document-details/${folder.folderId}`
				);

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Upload document details</span><h1');
				expect(unprettifiedElement.innerHTML).toContain(
					`${convertToTitle(correspondenceCategory)} correspondence</h1>`
				);
				expect(unprettifiedElement.innerHTML).toContain('test-document.txt</h2>');
				expect(unprettifiedElement.innerHTML).toContain('Date received</legend>');
				expect(unprettifiedElement.innerHTML).toContain('Redaction status</legend>');
			});

			it(`should render a back link to the upload document page (${correspondenceCategory})`, async () => {
				const addDocumentsResponse = await request
					.post(
						// @ts-ignore
						`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/upload-documents/${folder.folderId}`
					)
					.send({
						'upload-info': fileUploadInfo
					});

				expect(addDocumentsResponse.statusCode).toBe(302);
				expect(addDocumentsResponse.text).toContain(
					// @ts-ignore
					`Found. Redirecting to /appeals-service/appeal-details/1/internal-correspondence/${correspondenceCategory}/add-document-details/${folder.folderId}`
				);

				const response = await request.get(
					// @ts-ignore
					`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/add-document-details/${folder.folderId}`
				);
				const element = parseHtml(response.text, {
					rootElement: '.govuk-back-link',
					skipPrettyPrint: true
				});

				expect(element.innerHTML).toContain(
					// @ts-ignore
					`href="/appeals-service/appeal-details/1/internal-correspondence/${correspondenceCategory}/upload-documents/${folder.folderId}"`
				);
			});
		}
	});

	describe('POST /internal-correspondence/:correspondenceCategory/add-document-details/:folderId', () => {
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
				.get('/appeals/1/document-folders/22')
				.reply(200, folderInfoMainPartyCorrespondence)
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
				const folder = getFolder(correspondenceCategory);

				addDocumentsResponse = await request
					.post(
						// @ts-ignore
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
			const folder = getFolder(correspondenceCategory);

			it(`should re-render the document details page with the expected error message if the request body is in an incorrect format (${correspondenceCategory})`, async () => {
				expect(addDocumentsResponse.statusCode).toBe(302);

				const response = await request
					.post(
						// @ts-ignore
						`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/add-document-details/${folder.folderId}`
					)
					.send({});

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Upload document details</span><h1');
				expect(unprettifiedElement.innerHTML).toContain(
					`${convertToTitleForChangePage(correspondenceCategory)} correspondence</h1>`
				);

				const errorSummaryElement = parseHtml(response.text, {
					rootElement: '.govuk-error-summary'
				});

				expect(errorSummaryElement.innerHTML).toContain('There is a problem with the service');
			});

			it(`should re-render the document details page with the expected error message if receivedDate day is an invalid value (${correspondenceCategory})`, async () => {
				expect(addDocumentsResponse.statusCode).toBe(302);

				const testCases = [
					{
						value: '',
						expectedError: `${capitalize(
							documentNameFromCategory(correspondenceCategory)
						)} date must include a day`
					},
					{
						value: 'a',
						expectedError: `${capitalize(
							documentNameFromCategory(correspondenceCategory)
						)} date day must be a number`
					},
					{
						value: '0',
						expectedError: `${capitalize(
							documentNameFromCategory(correspondenceCategory)
						)} date day must be between 1 and 31`
					},
					{
						value: '32',
						expectedError: `${capitalize(
							documentNameFromCategory(correspondenceCategory)
						)} date day must be between 1 and 31`
					}
				];

				for (const testCase of testCases) {
					const response = await request
						.post(
							// @ts-ignore
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

					expect(unprettifiedElement.innerHTML).toContain('Upload document details</span><h1');
					expect(unprettifiedElement.innerHTML).toContain(
						`${convertToTitleForChangePage(correspondenceCategory)} correspondence</h1>`
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
					{
						value: '',
						expectedError: `${capitalize(
							documentNameFromCategory(correspondenceCategory)
						)} date must include a month`
					},
					{
						value: 'a',
						expectedError: `${capitalize(
							documentNameFromCategory(correspondenceCategory)
						)} date must be a real date`
					},
					{
						value: '0',
						expectedError: `${capitalize(
							documentNameFromCategory(correspondenceCategory)
						)} date month must be between 1 and 12`
					},
					{
						value: '13',
						expectedError: `${capitalize(
							documentNameFromCategory(correspondenceCategory)
						)} date month must be between 1 and 12`
					}
				];

				for (const testCase of testCases) {
					const response = await request
						.post(
							// @ts-ignore
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

					expect(unprettifiedElement.innerHTML).toContain('Upload document details</span><h1');
					expect(unprettifiedElement.innerHTML).toContain(
						`${convertToTitleForChangePage(correspondenceCategory)} correspondence</h1>`
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
					{
						value: '',
						expectedError: `${capitalize(
							documentNameFromCategory(correspondenceCategory)
						)} date must include a year`
					},
					{
						value: 'a',
						expectedError: `${capitalize(
							documentNameFromCategory(correspondenceCategory)
						)} date year must be a number`
					},
					{
						value: '202',
						expectedError: `${capitalize(
							documentNameFromCategory(correspondenceCategory)
						)} date year must be 4 digits`
					}
				];

				for (const testCase of testCases) {
					const response = await request
						.post(
							// @ts-ignore
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

					expect(unprettifiedElement.innerHTML).toContain('Upload document details</span><h1');
					expect(unprettifiedElement.innerHTML).toContain(
						`${convertToTitleForChangePage(correspondenceCategory)} correspondence</h1>`
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
						// @ts-ignore
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

				expect(unprettifiedElement.innerHTML).toContain('Upload document details</span><h1');
				expect(unprettifiedElement.innerHTML).toContain(
					`${convertToTitleForChangePage(correspondenceCategory)} correspondence</h1>`
				);

				const errorSummaryElement = parseHtml(response.text, {
					rootElement: '.govuk-error-summary'
				});

				expect(errorSummaryElement.innerHTML).toContain(
					`${capitalize(documentNameFromCategory(correspondenceCategory))} date must be a real date`
				);
			});

			it(`should send a patch request to the appeal documents endpoint and redirect to the check and confirm page, if complete and valid document details were provided (${correspondenceCategory})`, async () => {
				expect(addDocumentsResponse.statusCode).toBe(302);

				const response = await request
					.post(
						// @ts-ignore
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
					// @ts-ignore
					`Found. Redirecting to /appeals-service/appeal-details/1/internal-correspondence/${correspondenceCategory}/check-your-answers/${folder.folderId}`
				);
			});
		}
	});

	describe('GET /internal-correspondence/:correspondenceCategory/add-document-details/:folderId/:documentId', () => {
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
				.get('/appeals/1/document-folders/22')
				.reply(200, folderInfoMainPartyCorrespondence)
				.persist();
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses)
				.persist();
		});

		for (const correspondenceCategory of correspondenceCategories) {
			const folder = getFolder(correspondenceCategory);

			it(`should render a 500 error page if fileUploadInfo is not present in the session (${correspondenceCategory})`, async () => {
				const response = await request.get(
					// @ts-ignore
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
						// @ts-ignore
						`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/upload-documents/${folder.folderId}/1`
					)
					.send({
						'upload-info': fileUploadInfo
					});

				expect(addDocumentsResponse.statusCode).toBe(302);
				expect(addDocumentsResponse.text).toContain(
					// @ts-ignore
					`Found. Redirecting to /appeals-service/appeal-details/1/internal-correspondence/${correspondenceCategory}/add-document-details/${folder.folderId}/1`
				);

				const response = await request.get(
					// @ts-ignore
					`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/add-document-details/${folder.folderId}/1`
				);

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Upload document details</span><h1');
				expect(unprettifiedElement.innerHTML).toContain(
					`${convertToTitle(correspondenceCategory)} correspondence</h1>`
				);
				expect(unprettifiedElement.innerHTML).toContain('test-document.txt</h2>');
				expect(unprettifiedElement.innerHTML).toContain('Date received</legend>');
				expect(unprettifiedElement.innerHTML).toContain('Redaction status</legend>');
			});

			it(`should render a back link to the upload document version page (${correspondenceCategory})`, async () => {
				const addDocumentsResponse = await request
					.post(
						// @ts-ignore
						`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/upload-documents/${folder.folderId}/1`
					)
					.send({
						'upload-info': fileUploadInfo
					});

				expect(addDocumentsResponse.statusCode).toBe(302);
				expect(addDocumentsResponse.text).toContain(
					// @ts-ignore
					`Found. Redirecting to /appeals-service/appeal-details/1/internal-correspondence/${correspondenceCategory}/add-document-details/${folder.folderId}/1`
				);

				const response = await request.get(
					// @ts-ignore
					`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/add-document-details/${folder.folderId}/1`
				);
				const element = parseHtml(response.text, {
					rootElement: '.govuk-back-link',
					skipPrettyPrint: true
				});

				expect(element.innerHTML).toContain(
					// @ts-ignore
					`href="/appeals-service/appeal-details/1/internal-correspondence/${correspondenceCategory}/upload-documents/${folder.folderId}/1"`
				);
			});
		}
	});

	describe('POST /internal-correspondence/:correspondenceCategory/add-document-details/:folderId/:documentId', () => {
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
				.get('/appeals/1/document-folders/22')
				.reply(200, folderInfoMainPartyCorrespondence)
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
				const folder = getFolder(correspondenceCategory);
				addDocumentsResponse = await request
					.post(
						// @ts-ignore
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
			const folder = getFolder(correspondenceCategory);

			it(`should re-render the document details page with the expected error message if the request body is in an incorrect format (${correspondenceCategory})`, async () => {
				expect(addDocumentsResponse.statusCode).toBe(302);

				const response = await request
					.post(
						// @ts-ignore
						`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/add-document-details/${folder.folderId}/1`
					)
					.send({});

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Upload document details</span><h1');
				expect(unprettifiedElement.innerHTML).toContain(
					`${convertToTitleForChangePage(correspondenceCategory)} correspondence</h1>`
				);

				const errorSummaryElement = parseHtml(response.text, {
					rootElement: '.govuk-error-summary'
				});

				expect(errorSummaryElement.innerHTML).toContain('There is a problem with the service');
			});

			it(`should re-render the document details page with the expected error message if receivedDate day is an invalid value (${correspondenceCategory})`, async () => {
				expect(addDocumentsResponse.statusCode).toBe(302);

				const testCases = [
					{
						value: '',
						expectedError: `${capitalize(
							documentNameFromCategory(correspondenceCategory)
						)} date must include a day`
					},
					{
						value: 'a',
						expectedError: `${capitalize(
							documentNameFromCategory(correspondenceCategory)
						)} date day must be a number`
					},
					{
						value: '0',
						expectedError: `${capitalize(
							documentNameFromCategory(correspondenceCategory)
						)} date day must be between 1 and 31`
					},
					{
						value: '32',
						expectedError: `${capitalize(
							documentNameFromCategory(correspondenceCategory)
						)} date day must be between 1 and 31`
					}
				];

				for (const testCase of testCases) {
					const response = await request
						.post(
							// @ts-ignore
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

					expect(unprettifiedElement.innerHTML).toContain('Upload document details</span><h1');
					expect(unprettifiedElement.innerHTML).toContain(
						`${convertToTitleForChangePage(correspondenceCategory)} correspondence</h1>`
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
					{
						value: '',
						expectedError: `${capitalize(
							documentNameFromCategory(correspondenceCategory)
						)} date must include a month`
					},
					{
						value: 'a',
						expectedError: `${capitalize(
							documentNameFromCategory(correspondenceCategory)
						)} date must be a real date`
					},
					{
						value: '0',
						expectedError: `${capitalize(
							documentNameFromCategory(correspondenceCategory)
						)} date month must be between 1 and 12`
					},
					{
						value: '13',
						expectedError: `${capitalize(
							documentNameFromCategory(correspondenceCategory)
						)} date month must be between 1 and 12`
					}
				];

				for (const testCase of testCases) {
					const response = await request
						.post(
							// @ts-ignore
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

					expect(unprettifiedElement.innerHTML).toContain('Upload document details</span><h1');
					expect(unprettifiedElement.innerHTML).toContain(
						`${convertToTitleForChangePage(correspondenceCategory)} correspondence</h1>`
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
					{
						value: '',
						expectedError: `${capitalize(
							documentNameFromCategory(correspondenceCategory)
						)} date must include a year`
					},
					{
						value: 'a',
						expectedError: `${capitalize(
							documentNameFromCategory(correspondenceCategory)
						)} date year must be a number`
					},
					{
						value: '202',
						expectedError: `${capitalize(
							documentNameFromCategory(correspondenceCategory)
						)} date year must be 4 digits`
					}
				];

				for (const testCase of testCases) {
					const response = await request
						.post(
							// @ts-ignore
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

					expect(unprettifiedElement.innerHTML).toContain('Upload document details</span><h1');
					expect(unprettifiedElement.innerHTML).toContain(
						`${convertToTitleForChangePage(correspondenceCategory)} correspondence</h1>`
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
						// @ts-ignore
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

				expect(unprettifiedElement.innerHTML).toContain('Upload document details</span><h1');
				expect(unprettifiedElement.innerHTML).toContain(
					`${convertToTitleForChangePage(correspondenceCategory)} correspondence</h1>`
				);

				const errorSummaryElement = parseHtml(response.text, {
					rootElement: '.govuk-error-summary'
				});

				expect(errorSummaryElement.innerHTML).toContain(
					`${capitalize(documentNameFromCategory(correspondenceCategory))} date must be a real date`
				);
			});

			it(`should send a patch request to the appeal documents endpoint and redirect to the check and confirm page, if complete and valid document details were provided (${correspondenceCategory})`, async () => {
				expect(addDocumentsResponse.statusCode).toBe(302);

				const response = await request
					.post(
						// @ts-ignore
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
					// @ts-ignore
					`Found. Redirecting to /appeals-service/appeal-details/1/internal-correspondence/${correspondenceCategory}/check-your-answers/${folder.folderId}/1`
				);
			});
		}
	});

	describe('GET /internal-correspondence/:correspondenceCategory/check-your-answers/:folderId', () => {
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
				.get('/appeals/1/document-folders/22')
				.reply(200, folderInfoMainPartyCorrespondence)
				.persist();
		});
		afterEach(() => {
			nock.cleanAll();
		});

		for (const correspondenceCategory of correspondenceCategories) {
			const folder = getFolder(correspondenceCategory);

			it(`should render a 500 error page if fileUploadInfo is not present in the session (${correspondenceCategory})`, async () => {
				const response = await request.get(
					// @ts-ignore
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

			it(`should render the upload documents check and confirm page with summary list row displaying info on the uploaded document (${correspondenceCategory})`, async () => {
				const addDocumentsResponse = await request
					.post(
						// @ts-ignore
						`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/upload-documents/${folder.folderId}`
					)
					.send({
						'upload-info': fileUploadInfo
					});

				expect(addDocumentsResponse.statusCode).toBe(302);

				const response = await request.get(
					// @ts-ignore
					`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/check-your-answers/${folder.folderId}`
				);

				expect(response.statusCode).toBe(200);

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain(
					correspondenceCategory === 'main-party'
						? 'Check details and add main party correspondence</h1>'
						: 'Check your answers</h1>'
				);
				expect(unprettifiedElement.innerHTML).toContain('File</dt>');
				expect(unprettifiedElement.innerHTML).toContain(
					'<a class="govuk-link" href="/documents/APP/Q9999/D/21/351062/download-uncommitted/1/test-document.txt" target="_blank">test-document.txt</a></dd>'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					// @ts-ignore
					`href="/appeals-service/appeal-details/1/internal-correspondence/${correspondenceCategory}/upload-documents/${folder.folderId}">Change<span class="govuk-visually-hidden"> file test-document.txt</span></a></dd>`
				);
				expect(unprettifiedElement.innerHTML).toContain('Date received</dt>');
				expect(unprettifiedElement.innerHTML).toContain(
					`${dateISOStringToDisplayDate(new Date().toISOString())}</dd>`
				);
				expect(unprettifiedElement.innerHTML).toContain(
					// @ts-ignore
					`href="/appeals-service/appeal-details/1/internal-correspondence/${correspondenceCategory}/add-document-details/${folder.folderId}">Change<span class="govuk-visually-hidden"> test-document.txt date received</span></a></dd>`
				);
				expect(unprettifiedElement.innerHTML).toContain('Redaction status</dt>');
				expect(unprettifiedElement.innerHTML).toContain('No redaction required</dd>');
				expect(unprettifiedElement.innerHTML).toContain(
					correspondenceCategory === 'main-party'
						? 'Add main party correspondence</button>'
						: 'Confirm</button>'
				);
			});
		}
	});

	describe('POST /internal-correspondence/:correspondenceCategory/check-your-answers/:folderId', () => {
		beforeEach(async () => {
			nock.cleanAll();
			nock('http://test/').get('/appeals/1?include=all').reply(200, appealData).persist();
			nock('http://test/')
				.get('/appeals/1/document-folders/10')
				.reply(200, folderInfoCrossTeamCorrespondence)
				.persist();
			nock('http://test/')
				.get('/appeals/1/document-folders/11')
				.reply(200, folderInfoInspectorCorrespondence)
				.persist();
			nock('http://test/')
				.get('/appeals/1/document-folders/22')
				.reply(200, folderInfoMainPartyCorrespondence)
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
			const folder = getFolder(correspondenceCategory);

			it('should render a 500 error page if fileUploadInfo is not present in the session', async () => {
				const response = await request
					.post(
						// @ts-ignore
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
						// @ts-ignore
						`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/upload-documents/${folder.folderId}`
					)
					.send({
						'upload-info': fileUploadInfo
					});

				expect(addDocumentsResponse.statusCode).toBe(302);

				const response = await request
					.post(
						// @ts-ignore
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
				.get('/appeals/1/document-folders/22')
				.reply(200, folderInfoMainPartyCorrespondence)
				.persist();
			nock('http://test/').get('/appeals/documents/1').reply(200, documentFileInfo);
		});
		afterEach(() => {
			nock.cleanAll();
		});

		for (const correspondenceCategory of correspondenceCategories) {
			const folder = getFolder(correspondenceCategory);

			it(`should render a 500 error page if fileUploadInfo is not present in the session (${correspondenceCategory})`, async () => {
				const response = await request.get(
					// @ts-ignore
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

			it(`should render the upload documents check and confirm page with summary list row displaying info on the uploaded document (${correspondenceCategory})`, async () => {
				const addDocumentsResponse = await request
					.post(
						// @ts-ignore
						`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/upload-documents/${folder.folderId}/1`
					)
					.send({
						'upload-info': fileUploadInfo
					});

				expect(addDocumentsResponse.statusCode).toBe(302);

				const response = await request.get(
					// @ts-ignore
					`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/check-your-answers/${folder.folderId}/1`
				);

				expect(response.statusCode).toBe(200);

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain(
					correspondenceCategory === 'main-party'
						? 'Check details and add main party correspondence</h1>'
						: 'Check your answers</h1>'
				);

				expect(unprettifiedElement.innerHTML).toContain('File</dt>');
				expect(unprettifiedElement.innerHTML).toContain(
					'<a class="govuk-link" href="/documents/APP/Q9999/D/21/351062/download-uncommitted/1/ph0-documentFileInfo.jpeg/2" target="_blank">test-document.txt</a></dd>'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					// @ts-ignore
					`href="/appeals-service/appeal-details/1/internal-correspondence/${correspondenceCategory}/upload-documents/${folder.folderId}/1">Change<span class="govuk-visually-hidden"> file test-document.txt</span></a></dd>`
				);
				expect(unprettifiedElement.innerHTML).toContain('Date received</dt>');
				expect(unprettifiedElement.innerHTML).toContain(
					`${dateISOStringToDisplayDate(new Date().toISOString())}</dd>`
				);
				expect(unprettifiedElement.innerHTML).toContain(
					// @ts-ignore
					`href="/appeals-service/appeal-details/1/internal-correspondence/${correspondenceCategory}/add-document-details/${folder.folderId}/1">Change<span class="govuk-visually-hidden"> test-document.txt date received</span></a></dd>`
				);
				expect(unprettifiedElement.innerHTML).toContain('Redaction status</dt>');
				expect(unprettifiedElement.innerHTML).toContain('No redaction required</dd>');
				expect(unprettifiedElement.innerHTML).toContain(
					correspondenceCategory === 'main-party'
						? 'Add main party correspondence</button>'
						: 'Confirm</button>'
				);
			});
		}
	});

	describe('POST /internal-correspondence/:correspondenceCategory/check-your-answers/:folderId/:documentId', () => {
		beforeEach(async () => {
			nock.cleanAll();
			nock('http://test/').get('/appeals/1?include=all').reply(200, appealData).persist();
			nock('http://test/')
				.get('/appeals/1/document-folders/10')
				.reply(200, folderInfoCrossTeamCorrespondence)
				.persist();
			nock('http://test/')
				.get('/appeals/1/document-folders/11')
				.reply(200, folderInfoInspectorCorrespondence)
				.persist();
			nock('http://test/')
				.get('/appeals/1/document-folders/22')
				.reply(200, folderInfoMainPartyCorrespondence)
				.persist();
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses)
				.persist();
			nock('http://test/').get('/appeals/documents/1').reply(200, documentFileInfo);
		});
		afterEach(() => {
			nock.cleanAll();
		});

		for (const correspondenceCategory of correspondenceCategories) {
			const folder = getFolder(correspondenceCategory);

			it('should render a 500 error page if fileUploadInfo is not present in the session', async () => {
				const response = await request
					.post(
						// @ts-ignore
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
						// @ts-ignore
						`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/upload-documents/${folder.folderId}/1`
					)
					.send({
						'upload-info': fileUploadInfo
					});

				expect(addDocumentsResponse.statusCode).toBe(302);

				const response = await request
					.post(
						// @ts-ignore
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
				.get('/appeals/1/document-folders/22')
				.reply(200, folderInfoMainPartyCorrespondence)
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
			const folder = getFolder(correspondenceCategory);

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
					`${convertToTitle(correspondenceCategory)} correspondence documents</h1>`
				);
				expect(unprettifiedElement.innerHTML).toContain(
					`<a href="/appeals-service/appeal-details/1/internal-correspondence/${correspondenceCategory}/upload-documents/${folder.folderId}" role="button" draggable="false" class="govuk-button govuk-button--secondary" data-module="govuk-button"> Upload document</a>`
				);
			});
		}
	});

	describe('GET /internal-correspondence/:correspondenceCategory/manage-documents/:folderId/:documentId', () => {
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
			nock('http://test/')
				.get('/appeals/1/document-folders/22')
				.reply(200, folderInfoMainPartyCorrespondence)
				.persist();
			nock('http://test/').get('/appeals/documents/1').reply(200, documentFileInfo);
		});

		for (const correspondenceCategory of correspondenceCategories) {
			const folder = getFolder(correspondenceCategory);

			it(`should render a 404 error page if the folderId is not valid (${correspondenceCategory})`, async () => {
				nock('http://test/')
					.get('/appeals/documents/1/versions')
					.reply(200, documentFileVersionsInfo);

				const response = await request.get(
					`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/manage-documents/99/1`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const h1Element = parseHtml(response.text, { rootElement: 'main h1' });

				expect(h1Element.innerHTML).toContain('Page not found');
			});

			it(`should render a 404 error page if the documentId is not valid (${correspondenceCategory})`, async () => {
				nock('http://test/')
					.get('/appeals/documents/1/versions')
					.reply(200, documentFileVersionsInfo);

				const response = await request.get(
					// @ts-ignore
					`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/manage-documents/${folder.folderId}/99`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const h1Element = parseHtml(response.text, { rootElement: 'main h1' });

				expect(h1Element.innerHTML).toContain('Page not found');
			});

			it(`should render the manage individual document page with the expected content if the folderId and documentId are both valid and the document virus check status is null (${correspondenceCategory})`, async () => {
				nock('http://test/')
					.get('/appeals/documents/1/versions')
					.reply(200, documentFileVersionsInfo);

				const response = await request.get(
					// @ts-ignore
					`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/manage-documents/${folder.folderId}/1`
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

			it(`should render the manage individual document page with the expected content if the folderId and documentId are both valid and the document virus check status is "not_scanned" (${correspondenceCategory})`, async () => {
				nock('http://test/')
					.get('/appeals/documents/1/versions')
					.reply(200, documentFileVersionsInfoNotChecked);

				const response = await request.get(
					// @ts-ignore
					`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/manage-documents/${folder.folderId}/1`
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

			it(`should render the manage individual document page with the expected content if the folderId and documentId are both valid and the document virus check status is "affected" (${correspondenceCategory})`, async () => {
				nock('http://test/')
					.get('/appeals/documents/1/versions')
					.reply(200, documentFileVersionsInfoVirusFound);

				const response = await request.get(
					// @ts-ignore
					`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/manage-documents/${folder.folderId}/1`
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

			it(`should render the manage individual document page with the expected content if the folderId and documentId are both valid and the document virus check status is "scanned" (${correspondenceCategory})`, async () => {
				nock('http://test/')
					.get('/appeals/documents/1/versions')
					.reply(200, documentFileVersionsInfoChecked);

				const response = await request.get(
					// @ts-ignore
					`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/manage-documents/${folder.folderId}/1`
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
	});

	describe('GET /internal-correspondence/:correspondenceCategory/change-document-details/:folderId/:documentId', () => {
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
				.get('/appeals/1/document-folders/22')
				.reply(200, folderInfoMainPartyCorrespondence)
				.persist();
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses)
				.persist();
			nock('http://test/').get('/appeals/documents/1').reply(200, documentFileInfo);
		});

		for (const correspondenceCategory of correspondenceCategories) {
			const folder = getFolder(correspondenceCategory);

			it(`should render the change document details page with one set of fields for the document being changed (${correspondenceCategory})`, async () => {
				const response = await request.get(
					// @ts-ignore
					`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/change-document-details/${folder.folderId}/1`
				);

				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Change document details</span><h1');
				expect(unprettifiedElement.innerHTML).toContain(
					`${convertToTitleForChangePage(correspondenceCategory)} correspondence documents</h1>`
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
					'name="items[0][redactionStatus]" type="radio" value="no redaction required" checked>'
				);
				expect(unprettifiedElement.innerHTML).toContain('Confirm</button>');
			});

			it(`should render a back link to the manage individual document page (${correspondenceCategory})`, async () => {
				const response = await request.get(
					// @ts-ignore
					`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/change-document-details/${folder.folderId}/1`
				);

				const unprettifiedElement = parseHtml(response.text, {
					rootElement: '.govuk-back-link',
					skipPrettyPrint: true
				});

				expect(unprettifiedElement.innerHTML).toContain(
					// @ts-ignore
					`href="/appeals-service/appeal-details/1/internal-correspondence/${correspondenceCategory}/manage-documents/${folder.folderId}/1"`
				);
			});
		}
	});

	describe('POST /internal-correspondence/:correspondenceCategory/change-document-details/:folderId/:documentId', () => {
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
				.get('/appeals/1/document-folders/22')
				.reply(200, folderInfoMainPartyCorrespondence)
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
			nock('http://test/').get('/appeals/documents/1').reply(200, documentFileInfo).persist();
		});

		afterEach(() => {
			nock.cleanAll();
		});

		for (const correspondenceCategory of correspondenceCategories) {
			const folder = getFolder(correspondenceCategory);

			it(`should re-render the change document details page with the expected error message if the request body is in an incorrect format (${correspondenceCategory})`, async () => {
				const response = await request
					.post(
						// @ts-ignore
						`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/change-document-details/${folder.folderId}/1`
					)
					.send({});

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Change document details</span><h1');
				expect(unprettifiedElement.innerHTML).toContain(
					`${convertToTitleForChangePage(correspondenceCategory)} correspondence documents</h1>`
				);

				const errorSummaryElement = parseHtml(response.text, {
					rootElement: '.govuk-error-summary'
				});

				expect(errorSummaryElement.innerHTML).toContain('There is a problem with the service');
			});

			it(`should re-render the change document details page with the expected error message if receivedDate day is an invalid value (${correspondenceCategory})`, async () => {
				const testCases = [
					{
						value: '',
						expectedError: `${capitalize(
							documentNameFromCategory(correspondenceCategory)
						)} date must include a day`
					},
					{
						value: 'a',
						expectedError: `${capitalize(
							documentNameFromCategory(correspondenceCategory)
						)} date day must be a number`
					},
					{
						value: '0',
						expectedError: `${capitalize(
							documentNameFromCategory(correspondenceCategory)
						)} date day must be between 1 and 31`
					},
					{
						value: '32',
						expectedError: `${capitalize(
							documentNameFromCategory(correspondenceCategory)
						)} date day must be between 1 and 31`
					}
				];

				for (const testCase of testCases) {
					const response = await request
						.post(
							// @ts-ignore
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
						`${convertToTitleForChangePage(correspondenceCategory)} correspondence documents</h1>`
					);

					const errorSummaryElement = parseHtml(response.text, {
						rootElement: '.govuk-error-summary'
					});

					expect(errorSummaryElement.innerHTML).toContain(testCase.expectedError);
				}
			});

			it(`should re-render the change document details page with the expected error message if receivedDate month is an invalid value (${correspondenceCategory})`, async () => {
				const testCases = [
					{
						value: '',
						expectedError: `${capitalize(
							documentNameFromCategory(correspondenceCategory)
						)} date must include a month`
					},
					{
						value: 'a',
						expectedError: `${capitalize(
							documentNameFromCategory(correspondenceCategory)
						)} date must be a real date`
					},
					{
						value: '0',
						expectedError: `${capitalize(
							documentNameFromCategory(correspondenceCategory)
						)} date month must be between 1 and 12`
					},
					{
						value: '13',
						expectedError: `${capitalize(
							documentNameFromCategory(correspondenceCategory)
						)} date month must be between 1 and 12`
					}
				];

				for (const testCase of testCases) {
					const response = await request
						.post(
							// @ts-ignore
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
						`${convertToTitleForChangePage(correspondenceCategory)} correspondence documents</h1>`
					);

					const errorSummaryElement = parseHtml(response.text, {
						rootElement: '.govuk-error-summary'
					});

					expect(errorSummaryElement.innerHTML).toContain(testCase.expectedError);
				}
			});

			it(`should re-render the change document details page with the expected error message if receivedDate year is an invalid value (${correspondenceCategory})`, async () => {
				const testCases = [
					{
						value: '',
						expectedError: `${capitalize(
							documentNameFromCategory(correspondenceCategory)
						)} date must include a year`
					},
					{
						value: 'a',
						expectedError: `${capitalize(
							documentNameFromCategory(correspondenceCategory)
						)} date year must be a number`
					},
					{
						value: '202',
						expectedError: `${capitalize(
							documentNameFromCategory(correspondenceCategory)
						)} date year must be 4 digits`
					}
				];

				for (const testCase of testCases) {
					const response = await request
						.post(
							// @ts-ignore
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
						`${convertToTitleForChangePage(correspondenceCategory)} correspondence documents</h1>`
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
						// @ts-ignore
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
					`${convertToTitleForChangePage(correspondenceCategory)} correspondence documents</h1>`
				);

				const errorSummaryElement = parseHtml(response.text, {
					rootElement: '.govuk-error-summary'
				});

				expect(errorSummaryElement.innerHTML).toContain(
					`${capitalize(documentNameFromCategory(correspondenceCategory))} date must be a real date`
				);
			});

			it(`should send a patch request to the appeal documents endpoint and redirect to the manage individual document page, if complete and valid document details were provided (${correspondenceCategory})`, async () => {
				const response = await request
					.post(
						// @ts-ignore
						`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/change-document-details/${folder.folderId}/1`
					)
					.send({
						items: [
							{
								documentId: '4541e025-00e1-4458-aac6-d1b51f6ae0a7',
								receivedDate: {
									day: ' 1 ',
									month: ' Feb ',
									year: ' 2023 '
								},
								redactionStatus: 'unredacted'
							}
						]
					});

				expect(response.statusCode).toBe(302);
				expect(response.text).toEqual(
					// @ts-ignore
					`Found. Redirecting to /appeals-service/appeal-details/1/internal-correspondence/${correspondenceCategory}/manage-documents/${folder.folderId}/1`
				);
			});
		}
	});

	describe('GET /internal-correspondence/:correspondenceCategory/change-document-name/:folderId/:documentId', () => {
		beforeEach(() => {
			nock('http://test/').get('/appeals/1/document-folders/10').reply(200, documentFolderInfo);
			nock('http://test/').get('/appeals/1/document-folders/11').reply(200, documentFolderInfo);
			nock('http://test/').get('/appeals/1/document-folders/22').reply(200, documentFolderInfo);
			nock('http://test/').get('/appeals/documents/1').reply(200, documentFileInfo);
		});
		for (const correspondenceCategory of correspondenceCategories) {
			const folder = getFolder(correspondenceCategory);

			it(`should render the change document name page for the document being changed (${correspondenceCategory})`, async () => {
				const response = await request.get(
					// @ts-ignore
					`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/change-document-name/${folder.folderId}/1`
				);

				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Change document details</span><h1');
				expect(unprettifiedElement.innerHTML).toContain('File name');
				expect(unprettifiedElement.innerHTML).toContain('value="ph0-documentFileInfo">');
			});
		}
	});

	describe('POST /internal-correspondence/:correspondenceCategory/change-document-name/:folderId/:documentId', () => {
		beforeEach(() => {
			nock('http://test/').get('/appeals/document-redaction-statuses').reply(200, []);
			nock('http://test/').patch('/appeals/1/documents/1').reply(200, {});
			nock('http://test/').get('/appeals/1/document-folders/10').reply(200, documentFolderInfo);
			nock('http://test/').get('/appeals/1/document-folders/11').reply(200, documentFolderInfo);
			nock('http://test/').get('/appeals/1/document-folders/22').reply(200, documentFolderInfo);
			nock('http://test/').get('/appeals/documents/1').reply(200, documentFileInfo);
		});
		for (const correspondenceCategory of correspondenceCategories) {
			const folder = getFolder(correspondenceCategory);

			it(`should send a patch request to the appeal documents endpoint and redirect to the manage individual document page, if a new valid document name is provided (${correspondenceCategory})`, async () => {
				// @ts-ignore
				const fullUrl = `/appeals-service/appeal-details/1/internal-correspondence/${correspondenceCategory}/change-document-name/${folder.folderId}/1`;
				const response = await request
					.post(
						// @ts-ignore
						`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/change-document-name/${folder.folderId}/1`
					)
					.send({ fileName: 'new-name', documentId: '1' });

				expect(response.statusCode).toBe(302);
				expect(response.text).toContain(
					`Found. Redirecting to ${fullUrl.replace('change-document-name', 'manage-documents')}`
				);
			});
		}
	});

	describe('GET /internal-correspondence/:correspondenceCategory/manage-documents/:folderId/:documentId/:versionId/delete', () => {
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
			nock('http://test/')
				.get('/appeals/1/document-folders/22')
				.reply(200, folderInfoMainPartyCorrespondence)
				.persist();
			nock('http://test/').get('/appeals/documents/1').reply(200, documentFileInfo);
		});

		for (const correspondenceCategory of correspondenceCategories) {
			const folder = getFolder(correspondenceCategory);

			it(`should render the delete document page with the expected content when there is a single document version (${correspondenceCategory})`, async () => {
				nock('http://test/')
					.get('/appeals/documents/1/versions')
					.reply(200, documentFileVersionsInfoChecked);

				const response = await request.get(
					// @ts-ignore
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
				const multipleVersionsDocument = structuredClone(documentFileVersionsInfoChecked);
				multipleVersionsDocument.allVersions.push(multipleVersionsDocument.allVersions[0]);

				nock('http://test/')
					.get('/appeals/documents/1/versions')
					.reply(200, multipleVersionsDocument);

				const response = await request.get(
					// @ts-ignore
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
			nock('http://test/')
				.get('/appeals/1/document-folders/22')
				.reply(200, folderInfoMainPartyCorrespondence)
				.persist();
			nock('http://test/').get('/appeals/documents/1').reply(200, documentFileInfo);
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

		for (const correspondenceCategory of correspondenceCategories) {
			const folder = getFolder(correspondenceCategory);

			it(`should re-render the delete document page with the expected error message if answer was not provided (${correspondenceCategory})`, async () => {
				nock('http://test/')
					.get('/appeals/documents/1/versions')
					.reply(200, documentFileVersionsInfo);

				const response = await request
					.post(
						// @ts-ignore
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
						// @ts-ignore
						`${baseUrl}/1/internal-correspondence/${correspondenceCategory}/manage-documents/${folder.folderId}/1/1/delete`
					)
					.send({
						'delete-file-answer': 'no'
					});

				expect(response.statusCode).toBe(302);
				expect(response.text).toContain('Found. Redirecting to ');
				expect(response.text).toContain(
					// @ts-ignore
					`/appeals-service/appeal-details/1/internal-correspondence/${correspondenceCategory}/manage-documents/${folder.folderId}/1`
				);
			});

			it(`should send an API request to delete the document, and redirect to the case details page, if answer "yes" was provided`, async () => {
				nock('http://test/')
					.get('/appeals/documents/1/versions')
					.reply(200, documentFileVersionsInfo);

				const response = await request
					.post(
						// @ts-ignore
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
