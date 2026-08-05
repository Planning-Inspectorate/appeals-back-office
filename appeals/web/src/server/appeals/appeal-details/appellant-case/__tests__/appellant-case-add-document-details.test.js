import {
	additionalDocumentsFolderInfo,
	appealData,
	appellantCaseDataIncompleteOutcome,
	appellantCaseDataInvalidOutcome,
	appellantCaseDataNotValidated,
	appellantCaseDataValidOutcome,
	documentFolderInfo,
	documentRedactionStatuses,
	fileUploadInfo
} from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { jest } from '@jest/globals';
import { parseHtml } from '@pins/platform';

import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';
const appellantCasePagePath = '/appellant-case';

const existsResponse = {
	id: appellantCaseDataNotValidated.appealId,
	appealId: appellantCaseDataNotValidated.appealId,
	appealReference: appellantCaseDataNotValidated.appealReference
};

/**
 * @param {number} folderId
 * @returns {string}
 */
const getFolderApiUrl = (folderId) =>
	`/appeals/1/document-folders/${folderId}?pageNumber=1&pageSize=100`;

describe('appellant-case add-document-details', () => {
	afterAll(() => {
		nock.cleanAll();
		nock.restore();
		jest.clearAllMocks();
	});
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('GET /appellant-case/add-document-details/:folderId/', () => {
		beforeEach(() => {
			nock.cleanAll();
			nock('http://test/').get('/appeals/1/exists').reply(200, existsResponse).persist();
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses)
				.persist();
		});
		afterEach(() => {
			nock.cleanAll();
		});

		it('should render a 500 error page if fileUploadInfo is not present in the session', async () => {
			nock('http://test/')
				.get('/appeals/1?include=appealType,appellantCase')
				.reply(200, appellantCaseDataNotValidated);
			nock('http://test/')
				.get('/appeals/1/appellant-cases/1')
				.reply(200, appellantCaseDataNotValidated);
			nock('http://test/')
				.get(getFolderApiUrl(1))
				.reply(200, additionalDocumentsFolderInfo)
				.persist();

			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}/add-document-details/1`
			);

			expect(response.statusCode).toBe(500);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Sorry, there is a problem with the service</h1>'
			);
		});

		it('should render the add document details page with one item per uploaded document, and without a late entry status tag and associated details component, if the folder is not additional documents or changedDescription', async () => {
			nock('http://test/')
				.get('/appeals/1/appellant-cases/1')
				.reply(200, appellantCaseDataNotValidated);
			nock('http://test/')
				.get('/appeals/1?include=appealType,appellantCase')
				.reply(200, appellantCaseDataNotValidated);
			nock('http://test/')
				.get(getFolderApiUrl(1))
				.reply(200, { ...documentFolderInfo, path: 'appellant-case/appellantStatement' })
				.persist();

			const addDocumentsResponse = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-documents/1`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}/add-document-details/1`
			);

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
			expect(unprettifiedElement.innerHTML).toContain('Appellant statement documents</h1>');
			expect(unprettifiedElement.innerHTML).toContain('test-document.txt</h2>');
			expect(unprettifiedElement.innerHTML).toContain('Date received</legend>');
			expect(unprettifiedElement.innerHTML).toContain('Redaction status</legend>');

			expect(unprettifiedElement.innerHTML).not.toContain(
				'<strong class="govuk-tag govuk-tag--pink">Late entry</strong>'
			);
			expect(unprettifiedElement.innerHTML).not.toContain('What is late entry?</span>');
		});

		it.each([
			[
				'householder',
				APPEAL_TYPE.HOUSEHOLDER,
				'Agreement to change the description of development</h1>'
			],
			['full planning', APPEAL_TYPE.S78, 'Agreement to change the description of development</h1>'],
			[
				'listed building',
				APPEAL_TYPE.PLANNED_LISTED_BUILDING,
				'Agreement to change the description of development</h1>'
			],
			[
				'cas planning',
				APPEAL_TYPE.CAS_PLANNING,
				'Agreement to change the description of development</h1>'
			],
			[
				'cas advertisement',
				APPEAL_TYPE.CAS_ADVERTISEMENT,
				'Agreement to change the description of the advertisement</h1>'
			],
			[
				'advertisement',
				APPEAL_TYPE.ADVERTISEMENT,
				'Agreement to change the description of the advertisement</h1>'
			]
		])(
			'should render the add document details page with one item per uploaded document, and without a late entry status tag and associated details component, if the folder is changedDescription and appeal type is %s',
			async (_, appealType, expectedText) => {
				nock.cleanAll(); // need to remove the nocks so we can change the appeal type
				nock('http://test/').get('/appeals/1/exists').reply(200, existsResponse).persist();
				nock('http://test/')
					.get('/appeals/1?include=appealType,appellantCase')
					.reply(200, { ...appealData, appealType: appealType });
				nock('http://test/')
					.get('/appeals/document-redaction-statuses')
					.reply(200, documentRedactionStatuses)
					.persist();
				nock('http://test/')
					.get('/appeals/1/appellant-cases/0')
					.reply(200, appellantCaseDataNotValidated);
				nock('http://test/')
					.get(getFolderApiUrl(1))
					.reply(200, { ...documentFolderInfo, path: 'appellant-case/changedDescription' })
					.persist();

				const addDocumentsResponse = await request
					.post(`${baseUrl}/1${appellantCasePagePath}/add-documents/1`)
					.send({
						'upload-info': fileUploadInfo
					});

				expect(addDocumentsResponse.statusCode).toBe(302);

				const response = await request.get(
					`${baseUrl}/1${appellantCasePagePath}/add-document-details/1`
				);

				expect(response.statusCode).toBe(200);

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
				expect(unprettifiedElement.innerHTML).toContain(expectedText);
				expect(unprettifiedElement.innerHTML).toContain('test-document.txt</h2>');
				expect(unprettifiedElement.innerHTML).toContain('Date received</legend>');
				expect(unprettifiedElement.innerHTML).toContain('Redaction status</legend>');

				expect(unprettifiedElement.innerHTML).not.toContain(
					'<strong class="govuk-tag govuk-tag--pink">Late entry</strong>'
				);
				expect(unprettifiedElement.innerHTML).not.toContain('What is late entry?</span>');
			}
		);

		it('should render the add document details page with one item per uploaded document, and without a late entry status tag and associated details component, if the folder is additional documents, and the appellant case has no validation outcome', async () => {
			nock('http://test/')
				.get('/appeals/1?include=appealType,appellantCase')
				.reply(200, appellantCaseDataNotValidated);
			nock('http://test/')
				.get('/appeals/1/appellant-cases/1')
				.reply(200, appellantCaseDataNotValidated);
			nock('http://test/')
				.get(getFolderApiUrl(1))
				.reply(200, additionalDocumentsFolderInfo)
				.persist();

			const addDocumentsResponse = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-documents/1`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}/add-document-details/1`
			);

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
			expect(unprettifiedElement.innerHTML).toContain('Additional documents</h1>');
			expect(unprettifiedElement.innerHTML).toContain('test-document.txt</h2>');
			expect(unprettifiedElement.innerHTML).toContain('Date received</legend>');
			expect(unprettifiedElement.innerHTML).toContain('Redaction status</legend>');

			expect(unprettifiedElement.innerHTML).not.toContain(
				'<strong class="govuk-tag govuk-tag--pink">Late entry</strong>'
			);
			expect(unprettifiedElement.innerHTML).not.toContain('What is late entry?</span>');
		});

		it('should render the add document details page with one item per uploaded document, and without a late entry status tag and associated details component, if the folder is additional documents, and the appellant case has a validation outcome of invalid', async () => {
			nock('http://test/')
				.get('/appeals/1?include=appealType,appellantCase')
				.reply(200, appellantCaseDataInvalidOutcome);
			nock('http://test/')
				.get('/appeals/1/appellant-cases/1')
				.reply(200, appellantCaseDataInvalidOutcome);
			nock('http://test/')
				.get(getFolderApiUrl(1))
				.reply(200, additionalDocumentsFolderInfo)
				.persist();

			const addDocumentsResponse = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-documents/1`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}/add-document-details/1`
			);

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
			expect(unprettifiedElement.innerHTML).toContain('Additional documents</h1>');
			expect(unprettifiedElement.innerHTML).toContain('test-document.txt</h2>');
			expect(unprettifiedElement.innerHTML).toContain('Date received</legend>');
			expect(unprettifiedElement.innerHTML).toContain('Redaction status</legend>');

			expect(unprettifiedElement.innerHTML).not.toContain(
				'<strong class="govuk-tag govuk-tag--pink">Late entry</strong>'
			);
			expect(unprettifiedElement.innerHTML).not.toContain('What is late entry?</span>');
		});

		it('should render the add document details page with one item per uploaded document, and without a late entry status tag and associated details component, if the folder is additional documents, and the appellant case has a validation outcome of incomplete', async () => {
			nock('http://test/')
				.get('/appeals/1?include=appealType,appellantCase')
				.reply(200, appellantCaseDataIncompleteOutcome);
			nock('http://test/')
				.get('/appeals/1/appellant-cases/1')
				.reply(200, appellantCaseDataIncompleteOutcome);
			nock('http://test/')
				.get(getFolderApiUrl(1))
				.reply(200, additionalDocumentsFolderInfo)
				.persist();

			const addDocumentsResponse = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-documents/1`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}/add-document-details/1`
			);

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
			expect(unprettifiedElement.innerHTML).toContain('Additional documents</h1>');
			expect(unprettifiedElement.innerHTML).toContain('test-document.txt</h2>');
			expect(unprettifiedElement.innerHTML).toContain('Date received</legend>');
			expect(unprettifiedElement.innerHTML).toContain('Redaction status</legend>');

			expect(unprettifiedElement.innerHTML).not.toContain(
				'<strong class="govuk-tag govuk-tag--pink">Late entry</strong>'
			);
			expect(unprettifiedElement.innerHTML).not.toContain('What is late entry?</span>');
		});

		it('should render the add document details page with one item per uploaded document, and with a late entry status tag and associated details component, if the folder is additional documents, and the appellant case has a validation outcome of valid', async () => {
			nock('http://test/')
				.get('/appeals/1?include=appealType,appellantCase')
				.reply(200, appellantCaseDataValidOutcome);
			nock('http://test/')
				.get('/appeals/1/appellant-cases/1')
				.reply(200, appellantCaseDataValidOutcome);
			nock('http://test/')
				.get(getFolderApiUrl(1))
				.reply(200, additionalDocumentsFolderInfo)
				.persist();

			const addDocumentsResponse = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-documents/1`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}/add-document-details/1`
			);

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
			expect(unprettifiedElement.innerHTML).toContain('Additional documents</h1>');
			expect(unprettifiedElement.innerHTML).toContain('test-document.txt</h2>');
			expect(unprettifiedElement.innerHTML).toContain('Date received</legend>');
			expect(unprettifiedElement.innerHTML).toContain('Redaction status</legend>');

			expect(unprettifiedElement.innerHTML).toContain(
				'<strong class="govuk-tag govuk-tag--pink">Late entry</strong>'
			);
			expect(unprettifiedElement.innerHTML).toContain('What is late entry?</span>');
		});
	});

	describe('POST /appellant-case/add-document-details/:folderId/', () => {
		/**
		 * @type {import("superagent").Response}
		 */
		let addDocumentsResponse;

		beforeEach(async () => {
			nock('http://test/').get('/appeals/1/exists').reply(200, existsResponse).persist();

			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses)
				.persist();
			nock('http://test/').get(getFolderApiUrl(1)).reply(200, documentFolderInfo).persist();
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
				.post(`${baseUrl}/1${appellantCasePagePath}/add-documents/1`)
				.send({
					'upload-info': fileUploadInfo
				});
		});

		afterEach(() => {
			nock.cleanAll();
		});

		it('should re-render the document details page with the expected error message if the request body is in an incorrect format', async () => {
			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-document-details/1`)
				.send({});

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			});
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain('There is a problem with the service</a>');
		});

		it('should re-render the document details page with the expected error message if receivedDate day is empty', async () => {
			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-document-details/1`)
				.send({
					items: [
						{
							documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
							receivedDate: {
								day: '',
								month: '2',
								year: '2030'
							},
							redactionStatus: 2
						}
					]
				});

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			});
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Agreement to change description evidence date must include a day</a>'
			);
		});

		it('should re-render the document details page with the expected error message if receivedDate day is non-numeric', async () => {
			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-document-details/1`)
				.send({
					items: [
						{
							documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
							receivedDate: {
								day: 'a',
								month: '2',
								year: '2030'
							},
							redactionStatus: 2
						}
					]
				});

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			});
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Agreement to change description evidence date day must be a number</a>'
			);
		});

		it('should re-render the document details page with the expected error message if receivedDate day is less than 1', async () => {
			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-document-details/1`)
				.send({
					items: [
						{
							documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
							receivedDate: {
								day: '0',
								month: '2',
								year: '2030'
							},
							redactionStatus: 2
						}
					]
				});

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			});
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Agreement to change description evidence date day must be between 1 and 31</a>'
			);
		});

		it('should re-render the document details page with the expected error message if receivedDate day is greater than 31', async () => {
			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-document-details/1`)
				.send({
					items: [
						{
							documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
							receivedDate: {
								day: '32',
								month: '2',
								year: '2030'
							},
							redactionStatus: 2
						}
					]
				});

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			});
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Agreement to change description evidence date day must be between 1 and 31</a>'
			);
		});

		it('should re-render the document details page with the expected error message if receivedDate month is empty', async () => {
			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-document-details/1`)
				.send({
					items: [
						{
							documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
							receivedDate: {
								day: '1',
								month: '',
								year: '2030'
							},
							redactionStatus: 2
						}
					]
				});

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			});
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Agreement to change description evidence date must include a month</a>'
			);
		});

		it('should re-render the document details page with the expected error message if receivedDate month is non-numeric', async () => {
			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-document-details/1`)
				.send({
					items: [
						{
							documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
							receivedDate: {
								day: '1',
								month: 'a',
								year: '2030'
							},
							redactionStatus: 2
						}
					]
				});

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			});
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Agreement to change description evidence date must be a real date</a>'
			);
		});

		it('should re-render the document details page with the expected error message if receivedDate month is less than 1', async () => {
			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-document-details/1`)
				.send({
					items: [
						{
							documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
							receivedDate: {
								day: '1',
								month: '0',
								year: '2030'
							},
							redactionStatus: 2
						}
					]
				});

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			});
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Agreement to change description evidence date month must be between 1 and 12</a>'
			);
		});

		it('should re-render the document details page with the expected error message if receivedDate month is greater than 12', async () => {
			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-document-details/1`)
				.send({
					items: [
						{
							documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
							receivedDate: {
								day: '1',
								month: '13',
								year: '2030'
							},
							redactionStatus: 2
						}
					]
				});

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			});
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Agreement to change description evidence date month must be between 1 and 12</a>'
			);
		});

		it('should re-render the document details page with the expected error message if receivedDate year is empty', async () => {
			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-document-details/1`)
				.send({
					items: [
						{
							documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
							receivedDate: {
								day: '1',
								month: '2',
								year: ''
							},
							redactionStatus: 2
						}
					]
				});

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			});
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Agreement to change description evidence date must include a year</a>'
			);
		});

		it('should re-render the document details page with the expected error message if receivedDate year is non-numeric', async () => {
			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-document-details/1`)
				.send({
					items: [
						{
							documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
							receivedDate: {
								day: '1',
								month: '2',
								year: 'a'
							},
							redactionStatus: 2
						}
					]
				});

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			});
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Agreement to change description evidence date year must be a number</a>'
			);
		});

		it('should re-render the document details page with the expected error message if receivedDate is not a valid date', async () => {
			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-document-details/1`)
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

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			});
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Agreement to change description evidence date must be a real date</a>'
			);
		});

		it('should send a patch request to the appeal documents endpoint and redirect to the check your answers page, if complete and valid document details were provided', async () => {
			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-document-details/1`)
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
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/appellant-case/add-documents/2864/check-your-answers'
			);
		});
	});

	describe('GET /appellant-case/add-document-details/:folderId/:documentId', () => {
		beforeEach(() => {
			nock.cleanAll();

			nock('http://test/').get('/appeals/1/exists').reply(200, existsResponse).persist();
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses)
				.persist();
		});
		afterEach(() => {
			nock.cleanAll();
		});

		it('should render a 500 error page if fileUploadInfo is not present in the session', async () => {
			nock('http://test/')
				.get('/appeals/1?include=appealType,appellantCase')
				.reply(200, appellantCaseDataNotValidated);
			nock('http://test/')
				.get('/appeals/1/appellant-cases/1')
				.reply(200, appellantCaseDataNotValidated);
			nock('http://test/').get(getFolderApiUrl(1)).reply(200, documentFolderInfo).persist();

			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}/add-document-details/1/1`
			);

			expect(response.statusCode).toBe(500);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Sorry, there is a problem with the service</h1>'
			);
		});

		it('should render the add document details page with one item per uploaded document, and without a late entry status tag and associated details component, if the folder is not additional documents or changed description', async () => {
			nock('http://test/')
				.get('/appeals/1?include=appealType,appellantCase')
				.reply(200, appellantCaseDataNotValidated);
			nock('http://test/')
				.get('/appeals/1/appellant-cases/1')
				.reply(200, appellantCaseDataNotValidated);
			nock('http://test/')
				.get(getFolderApiUrl(1))
				.reply(200, { ...documentFolderInfo, path: 'appellant-case/appellantStatement' })
				.persist();

			const addDocumentsResponse = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-documents/1/1`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}/add-document-details/1/1`
			);

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
			expect(unprettifiedElement.innerHTML).toContain('Updated appellant statement document</h1>');
			expect(unprettifiedElement.innerHTML).toContain('test-document.txt</h2>');
			expect(unprettifiedElement.innerHTML).toContain('Date received</legend>');
			expect(unprettifiedElement.innerHTML).toContain('Redaction status</legend>');

			expect(unprettifiedElement.innerHTML).not.toContain(
				'<strong class="govuk-tag govuk-tag--pink">Late entry</strong>'
			);
			expect(unprettifiedElement.innerHTML).not.toContain('What is late entry?</span>');
		});

		it('should render the add document details page with one item per uploaded document, and without a late entry status tag and associated details component, if the folder is additional documents, and the appellant case has no validation outcome', async () => {
			nock('http://test/')
				.get('/appeals/1?include=appealType,appellantCase')
				.reply(200, appellantCaseDataNotValidated);
			nock('http://test/')
				.get('/appeals/1/appellant-cases/1')
				.reply(200, appellantCaseDataNotValidated);
			nock('http://test/')
				.get(getFolderApiUrl(2))
				.reply(200, additionalDocumentsFolderInfo)
				.persist();

			const addDocumentsResponse = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-documents/2/1`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}/add-document-details/2/1`
			);

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
			expect(unprettifiedElement.innerHTML).toContain('Updated additional document</h1>');
			expect(unprettifiedElement.innerHTML).toContain('test-document.txt</h2>');
			expect(unprettifiedElement.innerHTML).toContain('Date received</legend>');
			expect(unprettifiedElement.innerHTML).toContain('Redaction status</legend>');

			expect(unprettifiedElement.innerHTML).not.toContain(
				'<strong class="govuk-tag govuk-tag--pink">Late entry</strong>'
			);
			expect(unprettifiedElement.innerHTML).not.toContain('What is late entry?</span>');
		});

		it('should render the add document details page with one item per uploaded document, and without a late entry status tag and associated details component, if the folder is additional documents, and the appellant case has a validation outcome of invalid', async () => {
			nock('http://test/')
				.get('/appeals/1?include=appealType,appellantCase')
				.reply(200, appellantCaseDataInvalidOutcome);
			nock('http://test/')
				.get('/appeals/1/appellant-cases/1')
				.reply(200, appellantCaseDataInvalidOutcome);
			nock('http://test/')
				.get(getFolderApiUrl(2))
				.reply(200, additionalDocumentsFolderInfo)
				.persist();

			const addDocumentsResponse = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-documents/2/1`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}/add-document-details/2/1`
			);

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
			expect(unprettifiedElement.innerHTML).toContain('Updated additional document</h1>');
			expect(unprettifiedElement.innerHTML).toContain('test-document.txt</h2>');
			expect(unprettifiedElement.innerHTML).toContain('Date received</legend>');
			expect(unprettifiedElement.innerHTML).toContain('Redaction status</legend>');

			expect(unprettifiedElement.innerHTML).not.toContain(
				'<strong class="govuk-tag govuk-tag--pink">Late entry</strong>'
			);
			expect(unprettifiedElement.innerHTML).not.toContain('What is late entry?</span>');
		});

		it('should render the add document details page with one item per uploaded document, and without a late entry status tag and associated details component, if the folder is additional documents, and the appellant case has a validation outcome of incomplete', async () => {
			nock('http://test/')
				.get('/appeals/1?include=appealType,appellantCase')
				.reply(200, appellantCaseDataIncompleteOutcome);
			nock('http://test/')
				.get('/appeals/1/appellant-cases/1')
				.reply(200, appellantCaseDataIncompleteOutcome);
			nock('http://test/')
				.get(getFolderApiUrl(2))
				.reply(200, additionalDocumentsFolderInfo)
				.persist();

			const addDocumentsResponse = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-documents/2/1`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}/add-document-details/2/1`
			);

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
			expect(unprettifiedElement.innerHTML).toContain('Updated additional document</h1>');
			expect(unprettifiedElement.innerHTML).toContain('test-document.txt</h2>');
			expect(unprettifiedElement.innerHTML).toContain('Date received</legend>');
			expect(unprettifiedElement.innerHTML).toContain('Redaction status</legend>');

			expect(unprettifiedElement.innerHTML).not.toContain(
				'<strong class="govuk-tag govuk-tag--pink">Late entry</strong>'
			);
			expect(unprettifiedElement.innerHTML).not.toContain('What is late entry?</span>');
		});

		it('should render the add document details page with one item per uploaded document, and with a late entry status tag and associated details component, if the folder is additional documents, and the appellant case has a validation outcome of valid', async () => {
			nock('http://test/')
				.get('/appeals/1?include=appealType,appellantCase')
				.reply(200, appellantCaseDataValidOutcome);
			nock('http://test/')
				.get('/appeals/1/appellant-cases/1')
				.reply(200, appellantCaseDataValidOutcome);
			nock('http://test/')
				.get(getFolderApiUrl(2))
				.reply(200, additionalDocumentsFolderInfo)
				.persist();

			const addDocumentsResponse = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-documents/2/1`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}/add-document-details/2/1`
			);

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
			expect(unprettifiedElement.innerHTML).toContain('Updated additional document</h1>');
			expect(unprettifiedElement.innerHTML).toContain('test-document.txt</h2>');
			expect(unprettifiedElement.innerHTML).toContain('Date received</legend>');
			expect(unprettifiedElement.innerHTML).toContain('Redaction status</legend>');

			expect(unprettifiedElement.innerHTML).toContain(
				'<strong class="govuk-tag govuk-tag--pink">Late entry</strong>'
			);
			expect(unprettifiedElement.innerHTML).toContain('What is late entry?</span>');
		});
	});

	describe('POST /appellant-case/add-document-details/:folderId/:documentId', () => {
		/**
		 * @type {import("superagent").Response}
		 */
		let addDocumentsResponse;

		beforeEach(async () => {
			nock('http://test/').get('/appeals/1/exists').reply(200, existsResponse).persist();

			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses)
				.persist();
			nock('http://test/').get(getFolderApiUrl(1)).reply(200, documentFolderInfo).persist();
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
				.post(`${baseUrl}/1${appellantCasePagePath}/add-documents/1/1`)
				.send({
					'upload-info': fileUploadInfo
				});
		});

		afterEach(() => {
			nock.cleanAll();
		});

		it('should re-render the document details page with the expected error message if the request body is in an incorrect format', async () => {
			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-document-details/1/1`)
				.send({});

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			});
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain('There is a problem with the service</a>');
		});

		it('should re-render the document details page with the expected error message if receivedDate day is empty', async () => {
			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-document-details/1/1`)
				.send({
					items: [
						{
							documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
							receivedDate: {
								day: '',
								month: '2',
								year: '2030'
							},
							redactionStatus: 2
						}
					]
				});

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			});
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Agreement to change description evidence date must include a day</a>'
			);
		});

		it('should re-render the document details page with the expected error message if receivedDate day is non-numeric', async () => {
			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-document-details/1/1`)
				.send({
					items: [
						{
							documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
							receivedDate: {
								day: 'a',
								month: '2',
								year: '2030'
							},
							redactionStatus: 2
						}
					]
				});

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			});
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Agreement to change description evidence date day must be a number</a>'
			);
		});

		it('should re-render the document details page with the expected error message if receivedDate day is less than 1', async () => {
			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-document-details/1/1`)
				.send({
					items: [
						{
							documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
							receivedDate: {
								day: '0',
								month: '2',
								year: '2030'
							},
							redactionStatus: 2
						}
					]
				});

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			});
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Agreement to change description evidence date day must be between 1 and 31</a>'
			);
		});

		it('should re-render the document details page with the expected error message if receivedDate day is greater than 31', async () => {
			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-document-details/1/1`)
				.send({
					items: [
						{
							documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
							receivedDate: {
								day: '32',
								month: '2',
								year: '2030'
							},
							redactionStatus: 2
						}
					]
				});

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			});
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Agreement to change description evidence date day must be between 1 and 31</a>'
			);
		});

		it('should re-render the document details page with the expected error message if receivedDate month is empty', async () => {
			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-document-details/1/1`)
				.send({
					items: [
						{
							documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
							receivedDate: {
								day: '1',
								month: '',
								year: '2030'
							},
							redactionStatus: 2
						}
					]
				});

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			});
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Agreement to change description evidence date must include a month</a>'
			);
		});

		it('should re-render the document details page with the expected error message if receivedDate month is non-numeric', async () => {
			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-document-details/1/1`)
				.send({
					items: [
						{
							documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
							receivedDate: {
								day: '1',
								month: 'a',
								year: '2030'
							},
							redactionStatus: 2
						}
					]
				});

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			});
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Agreement to change description evidence date must be a real date</a>'
			);
		});

		it('should re-render the document details page with the expected error message if receivedDate month is less than 1', async () => {
			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-document-details/1/1`)
				.send({
					items: [
						{
							documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
							receivedDate: {
								day: '1',
								month: '0',
								year: '2030'
							},
							redactionStatus: 2
						}
					]
				});

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			});
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Agreement to change description evidence date month must be between 1 and 12</a>'
			);
		});

		it('should re-render the document details page with the expected error message if receivedDate month is greater than 12', async () => {
			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-document-details/1/1`)
				.send({
					items: [
						{
							documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
							receivedDate: {
								day: '1',
								month: '13',
								year: '2030'
							},
							redactionStatus: 2
						}
					]
				});

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			});
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Agreement to change description evidence date month must be between 1 and 12</a>'
			);
		});

		it('should re-render the document details page with the expected error message if receivedDate year is empty', async () => {
			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-document-details/1/1`)
				.send({
					items: [
						{
							documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
							receivedDate: {
								day: '1',
								month: '2',
								year: ''
							},
							redactionStatus: 2
						}
					]
				});

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			});
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Agreement to change description evidence date must include a year</a>'
			);
		});

		it('should re-render the document details page with the expected error message if receivedDate year is non-numeric', async () => {
			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-document-details/1/1`)
				.send({
					items: [
						{
							documentId: 'a6681be2-7cf8-4c9f-b223-f97f003577f3',
							receivedDate: {
								day: '1',
								month: '2',
								year: 'a'
							},
							redactionStatus: 2
						}
					]
				});

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			});
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Agreement to change description evidence date year must be a number</a>'
			);
		});

		it('should re-render the document details page with the expected error message if receivedDate is not a valid date', async () => {
			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-document-details/1/1`)
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

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			});
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Agreement to change description evidence date must be a real date</a>'
			);
		});

		it('should send a patch request to the appeal documents endpoint and redirect to the check your answers page, if complete and valid document details were provided', async () => {
			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-document-details/1/1`)
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
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/appellant-case/add-documents/1/1/check-your-answers'
			);
		});
	});
});
