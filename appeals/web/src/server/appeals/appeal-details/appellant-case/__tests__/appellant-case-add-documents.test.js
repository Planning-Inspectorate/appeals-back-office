import { dateISOStringToDisplayDate } from '#lib/dates.js';
import {
	additionalDocumentsFolderInfo,
	appealData,
	appellantCaseDataIncompleteOutcome,
	appellantCaseDataInvalidOutcome,
	appellantCaseDataNotValidated,
	appellantCaseDataValidOutcome,
	documentFileInfo,
	documentFileVersionsInfo,
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
const notificationBannerElement = '.govuk-notification-banner';

const existsResponse = { id: 1, appealId: 1, appealReference: appealData.appealReference };

/**
 * @param {number} folderId
 * @returns {string}
 */
const getFolderApiUrl = (folderId) =>
	`/appeals/1/document-folders/${folderId}?pageNumber=1&pageSize=100`;
describe('appellant-case documents', () => {
	afterAll(() => {
		nock.cleanAll();
		nock.restore();
		jest.clearAllMocks();
	});
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('GET /appellant-case/add-documents/:folderId/', () => {
		beforeEach(() => {
			nock.cleanAll();
			nock('http://test/').get('/appeals/1?include=all').reply(200, appealData);
			nock('http://test/')
				.get('/appeals/1?include=appealType,appellantCase')
				.reply(200, appealData);
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses);
		});
		afterEach(() => {
			nock.cleanAll();
		});

		it.each([
			[
				'householder',
				APPEAL_TYPE.HOUSEHOLDER,
				'Upload evidence of your agreement to change the description of development</h1>'
			],
			[
				'full planning',
				APPEAL_TYPE.S78,
				'Upload evidence of your agreement to change the description of development</h1>'
			],
			[
				'listed building',
				APPEAL_TYPE.PLANNED_LISTED_BUILDING,
				'Upload evidence of your agreement to change the description of development</h1>'
			],
			[
				'cas planning',
				APPEAL_TYPE.CAS_PLANNING,
				'Upload evidence of your agreement to change the description of development</h1>'
			],
			[
				'cas advertisement',
				APPEAL_TYPE.CAS_ADVERTISEMENT,
				'Upload evidence of your agreement to change the description of the advertisement</h1>'
			],
			[
				'advertisement',
				APPEAL_TYPE.ADVERTISEMENT,
				'Upload evidence of your agreement to change the description of the advertisement</h1>'
			]
		])(
			'should render a document upload page with a file upload component, and no late entry tag and associated details component, and no additional documents warning text, if the folder is changedDescription with correct text for %s',
			async (_, appealType, expectedText) => {
				nock.cleanAll(); // need to remove the nocks so we can change the appeal type
				nock('http://test/')
					.get('/appeals/1?include=all')
					.reply(200, { ...appealData, appealType: appealType });
				nock('http://test/')
					.get('/appeals/1?include=appealType,appellantCase')
					.reply(200, { ...appealData, appealType: appealType });
				nock('http://test/')
					.get('/appeals/document-redaction-statuses')
					.reply(200, documentRedactionStatuses);
				nock('http://test/')
					.get('/appeals/1/appellant-cases/0')
					.reply(200, appellantCaseDataNotValidated);
				nock('http://test/').get(getFolderApiUrl(1)).reply(200, documentFolderInfo);
				nock('http://test/').get('/appeals/documents/1').reply(200, documentFileInfo);

				const response = await request.get(`${baseUrl}/1${appellantCasePagePath}/add-documents/1`);

				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain(expectedText);
				expect(unprettifiedElement.innerHTML).toContain(
					'<div class="govuk-grid-row pins-file-upload"'
				);
				expect(unprettifiedElement.innerHTML).toContain('Choose files</button>');

				expect(unprettifiedElement.innerHTML).not.toContain(
					'<strong class="govuk-tag govuk-tag--pink">Late entry</strong>'
				);
				expect(unprettifiedElement.innerHTML).not.toContain('What is late entry?</span>');
				expect(unprettifiedElement.innerHTML).not.toContain('Warning</span>');
				expect(unprettifiedElement.innerHTML).not.toContain(
					'Only upload files to additional documents when no other folder is applicable.'
				);
			}
		);

		it('should render document upload page with additional documents warning text, and without late entry status tag and associated details component, if the folder is additional documents, and the appellant case has no validation outcome', async () => {
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataNotValidated);
			nock('http://test/').get(getFolderApiUrl(1)).reply(200, additionalDocumentsFolderInfo);

			const response = await request.get(`${baseUrl}/1${appellantCasePagePath}/add-documents/1`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Upload additional documents</h1>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<div class="govuk-grid-row pins-file-upload"'
			);
			expect(unprettifiedElement.innerHTML).toContain('Choose files</button>');

			expect(unprettifiedElement.innerHTML).not.toContain(
				'<strong class="govuk-tag govuk-tag--pink">Late entry</strong>'
			);
			expect(unprettifiedElement.innerHTML).not.toContain('What is late entry?</span>');
			expect(unprettifiedElement.innerHTML).toContain('Warning</span>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Only upload files to additional documents when no other folder is applicable.'
			);
		});

		it('should render document upload page with additional documents warning text, and without late entry status tag and associated details component, if the folder is additional documents, and the appellant case has a validation outcome of invalid', async () => {
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataInvalidOutcome);
			nock('http://test/').get(getFolderApiUrl(1)).reply(200, additionalDocumentsFolderInfo);

			const response = await request.get(`${baseUrl}/1${appellantCasePagePath}/add-documents/1`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Upload additional documents</h1>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<div class="govuk-grid-row pins-file-upload"'
			);
			expect(unprettifiedElement.innerHTML).toContain('Choose files</button>');

			expect(unprettifiedElement.innerHTML).not.toContain(
				'<strong class="govuk-tag govuk-tag--pink">Late entry</strong>'
			);
			expect(unprettifiedElement.innerHTML).not.toContain('What is late entry?</span>');
			expect(unprettifiedElement.innerHTML).toContain('Warning</span>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Only upload files to additional documents when no other folder is applicable.'
			);
		});

		it('should render document upload page with additional documents warning text, and without late entry status tag and associated details component, if the folder is additional documents, and the appellant case has a validation outcome of incomplete', async () => {
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataIncompleteOutcome);
			nock('http://test/').get(getFolderApiUrl(1)).reply(200, additionalDocumentsFolderInfo);

			const response = await request.get(`${baseUrl}/1${appellantCasePagePath}/add-documents/1`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Upload additional documents</h1>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<div class="govuk-grid-row pins-file-upload"'
			);
			expect(unprettifiedElement.innerHTML).toContain('Choose files</button>');

			expect(unprettifiedElement.innerHTML).not.toContain(
				'<strong class="govuk-tag govuk-tag--pink">Late entry</strong>'
			);
			expect(unprettifiedElement.innerHTML).not.toContain('What is late entry?</span>');
			expect(unprettifiedElement.innerHTML).toContain('Warning</span>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Only upload files to additional documents when no other folder is applicable.'
			);
		});

		it('should render document upload page with late entry status tag and associated details component, and without additional documents warning text, if the folder is additional documents, and the appellant case validation outcome is valid', async () => {
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataValidOutcome);
			nock('http://test/').get(getFolderApiUrl(1)).reply(200, additionalDocumentsFolderInfo);

			const response = await request.get(`${baseUrl}/1${appellantCasePagePath}/add-documents/1`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Upload additional documents</h1>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<div class="govuk-grid-row pins-file-upload"'
			);
			expect(unprettifiedElement.innerHTML).toContain('Choose files</button>');

			expect(unprettifiedElement.innerHTML).toContain(
				'<strong class="govuk-tag govuk-tag--pink">Late entry</strong>'
			);
			expect(unprettifiedElement.innerHTML).toContain('What is late entry?</span>');
			expect(unprettifiedElement.innerHTML).not.toContain('Warning</span>');
			expect(unprettifiedElement.innerHTML).not.toContain(
				'Only upload files to additional documents when no other folder is applicable.'
			);
		});
	});

	describe('GET /appellant-case/add-documents/:folderId/:documentId', () => {
		beforeEach(() => {
			nock.cleanAll();
			nock('http://test/')
				.get('/appeals/1?include=appealType,appellantCase')
				.reply(200, appealData);
			nock('http://test/').get('/appeals/documents/1').reply(200, documentFileInfo);
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses);
			nock('http://test/')
				.get('/appeals/documents/1/versions')
				.reply(200, documentFileVersionsInfo);
		});
		afterEach(() => {
			nock.cleanAll();
		});

		it('should render a document upload page with a file upload component, and no late entry tag and associated details component, and no additional documents warning text, if the folder is not additional documents', async () => {
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataNotValidated);
			nock('http://test/').get(getFolderApiUrl(1)).reply(200, documentFolderInfo);

			const response = await request.get(`${baseUrl}/1${appellantCasePagePath}/add-documents/1/1`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Evidence of your agreement to change the description of development</h1>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'<div class="govuk-grid-row pins-file-upload"'
			);
			expect(unprettifiedElement.innerHTML).toContain('Choose file</button>');

			expect(unprettifiedElement.innerHTML).not.toContain(
				'<strong class="govuk-tag govuk-tag--pink">Late entry</strong>'
			);
			expect(unprettifiedElement.innerHTML).not.toContain('What is late entry?</span>');
			expect(unprettifiedElement.innerHTML).not.toContain('Warning</span>');
			expect(unprettifiedElement.innerHTML).not.toContain(
				'Only upload files to additional documents when no other folder is applicable.'
			);
		});

		it('should render document upload page with additional documents warning text, and without late entry status tag and associated details component, if the folder is additional documents, and the appellant case has no validation outcome', async () => {
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataNotValidated);
			nock('http://test/').get(getFolderApiUrl(1)).reply(200, additionalDocumentsFolderInfo);

			const response = await request.get(`${baseUrl}/1${appellantCasePagePath}/add-documents/1/1`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Update additional document</h1>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<div class="govuk-grid-row pins-file-upload"'
			);
			expect(unprettifiedElement.innerHTML).toContain('Choose file</button>');

			expect(unprettifiedElement.innerHTML).not.toContain(
				'<strong class="govuk-tag govuk-tag--pink">Late entry</strong>'
			);
			expect(unprettifiedElement.innerHTML).not.toContain('What is late entry?</span>');
			expect(unprettifiedElement.innerHTML).toContain('Warning</span>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Only upload files to additional documents when no other folder is applicable.'
			);
		});

		it('should render document upload page with additional documents warning text, and without late entry status tag and associated details component, if the folder is additional documents, and the appellant case has a validation outcome of invalid', async () => {
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataInvalidOutcome);
			nock('http://test/').get(getFolderApiUrl(1)).reply(200, additionalDocumentsFolderInfo);

			const response = await request.get(`${baseUrl}/1${appellantCasePagePath}/add-documents/1/1`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Update additional document</h1>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<div class="govuk-grid-row pins-file-upload"'
			);
			expect(unprettifiedElement.innerHTML).toContain('Choose file</button>');

			expect(unprettifiedElement.innerHTML).not.toContain(
				'<strong class="govuk-tag govuk-tag--pink">Late entry</strong>'
			);
			expect(unprettifiedElement.innerHTML).not.toContain('What is late entry?</span>');
			expect(unprettifiedElement.innerHTML).toContain('Warning</span>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Only upload files to additional documents when no other folder is applicable.'
			);
		});

		it('should render document upload page with additional documents warning text, and without late entry status tag and associated details component, if the folder is additional documents, and the appellant case has a validation outcome of incomplete', async () => {
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataIncompleteOutcome);
			nock('http://test/').get(getFolderApiUrl(1)).reply(200, additionalDocumentsFolderInfo);

			const response = await request.get(`${baseUrl}/1${appellantCasePagePath}/add-documents/1/1`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Update additional document</h1>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<div class="govuk-grid-row pins-file-upload"'
			);
			expect(unprettifiedElement.innerHTML).toContain('Choose file</button>');

			expect(unprettifiedElement.innerHTML).not.toContain(
				'<strong class="govuk-tag govuk-tag--pink">Late entry</strong>'
			);
			expect(unprettifiedElement.innerHTML).not.toContain('What is late entry?</span>');
			expect(unprettifiedElement.innerHTML).toContain('Warning</span>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Only upload files to additional documents when no other folder is applicable.'
			);
		});

		it('should render document upload page with late entry status tag and associated details component, and without additional documents warning text, if the folder is additional documents, and the appellant case validation outcome is valid', async () => {
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataValidOutcome);
			nock('http://test/').get(getFolderApiUrl(1)).reply(200, additionalDocumentsFolderInfo);

			const response = await request.get(`${baseUrl}/1${appellantCasePagePath}/add-documents/1/1`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Update additional document</h1>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<div class="govuk-grid-row pins-file-upload"'
			);
			expect(unprettifiedElement.innerHTML).toContain('Choose file</button>');

			expect(unprettifiedElement.innerHTML).toContain(
				'<strong class="govuk-tag govuk-tag--pink">Late entry</strong>'
			);
			expect(unprettifiedElement.innerHTML).toContain('What is late entry?</span>');
			expect(unprettifiedElement.innerHTML).not.toContain('Warning</span>');
			expect(unprettifiedElement.innerHTML).not.toContain(
				'Only upload files to additional documents when no other folder is applicable.'
			);
		});
	});

	describe('POST /appellant-case/add-documents/:folderId/', () => {
		beforeEach(() => {
			nock.cleanAll();
			nock('http://test/').get('/appeals/1/exists').reply(200, existsResponse);
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses);
			nock('http://test/').get(getFolderApiUrl(1)).reply(200, documentFolderInfo);
		});
		afterEach(() => {
			nock.cleanAll();
		});

		it('should render a 500 error page if upload-info is not present in the request body', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-documents/1`)
				.send({});

			expect(response.statusCode).toBe(500);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Sorry, there is a problem with the service</h1>'
			);
		});

		it('should render a 500 error page if request body upload-info is in an incorrect format', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-documents/1`)
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

		it('should redirect to the add document details page if upload-info is present in the request body and in the correct format', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-documents/1`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/appellant-case/add-document-details/2864'
			);
		});
	});

	describe('POST /appellant-case/add-documents/:folderId/:documentId', () => {
		beforeEach(() => {
			nock.cleanAll();
			nock('http://test/').get('/appeals/1/exists').reply(200, existsResponse);
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses);
			nock('http://test/').get(getFolderApiUrl(1)).reply(200, documentFolderInfo);
			nock('http://test/').get('/appeals/documents/1').reply(200, documentFileInfo);
		});
		afterEach(() => {
			nock.cleanAll();
		});

		it('should render a 500 error page if upload-info is not present in the request body', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-documents/1/1`)
				.send({});

			expect(response.statusCode).toBe(500);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Sorry, there is a problem with the service</h1>'
			);
		});

		it('should render a 500 error page if request body upload-info is in an incorrect format', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-documents/1/1`)
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

		it('should redirect to the add document details page if upload-info is present in the request body and in the correct format', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-documents/1/1`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/appellant-case/add-document-details/2864/1'
			);
		});
	});

	describe('GET /appellant-case/add-documents/:folderId/check-your-answers', () => {
		beforeEach(() => {
			nock.cleanAll();
			nock('http://test/').get('/appeals/1/exists').reply(200, appealData).persist();
			nock('http://test/')
				.get(`/appeals/1?include=appellantCase`)
				.reply(200, {
					...appealData
				})
				.persist();
			nock('http://test/').get(getFolderApiUrl(1)).reply(200, documentFolderInfo).persist();
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses)
				.persist();
		});
		afterEach(() => {
			nock.cleanAll();
		});

		it('should render a 500 error page if fileUploadInfo is not present in the session', async () => {
			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}/add-documents/1/check-your-answers`
			);

			expect(response.statusCode).toBe(500);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Sorry, there is a problem with the service</h1>'
			);
		});

		it('should render the add documents check and confirm page with summary list displaying info on the uploaded document', async () => {
			const addDocumentsResponse = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-documents/1`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}/add-documents/1/check-your-answers`
			);

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Check your answers</h1>');
			expect(unprettifiedElement.innerHTML).toContain('File</dt>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<a class="govuk-link" href="/documents/APP/Q9999/D/21/351062/download-uncommitted/1/test-document.txt" target="_blank">test-document.txt</a></dd>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				`href="/appeals-service/appeal-details/1/appellant-case/add-documents/${documentFolderInfo.folderId}">Change<span class="govuk-visually-hidden"> file test-document.txt</span></a>`
			);
			expect(unprettifiedElement.innerHTML).toContain('Date received</dt>');
			expect(unprettifiedElement.innerHTML).toContain(
				`${dateISOStringToDisplayDate(new Date().toISOString())}</dd>`
			);
			expect(unprettifiedElement.innerHTML).toContain(
				`href="/appeals-service/appeal-details/1/appellant-case/add-document-details/${documentFolderInfo.folderId}">Change<span class="govuk-visually-hidden"> test-document.txt date received</span></a>`
			);
			expect(unprettifiedElement.innerHTML).toContain('Redaction status</dt>');
			expect(unprettifiedElement.innerHTML).toContain('No redaction required</dd>');
			expect(unprettifiedElement.innerHTML).toContain('Confirm</button>');
		});
	});

	describe('POST /appellant-case/add-documents/:folderId/check-your-answers', () => {
		beforeEach(() => {
			nock.cleanAll();
			nock('http://test/').get('/appeals/1?include=all').reply(200, appealData).persist();
			nock('http://test/')
				.get(`/appeals/1?include=appellantCase`)
				.reply(200, {
					...appealData
				})
				.persist();
			nock('http://test/').get('/appeals/1/exists').reply(200, existsResponse).persist();
			nock('http://test/').get(getFolderApiUrl(1)).reply(200, documentFolderInfo).persist();
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses)
				.persist();
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataNotValidated)
				.persist();
		});
		afterEach(() => {
			nock.cleanAll();
		});

		it('should render a 500 error page if fileUploadInfo is not present in the session', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-documents/1/check-your-answers`)
				.send({});

			expect(response.statusCode).toBe(500);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Sorry, there is a problem with the service</h1>'
			);
		});

		it('should send an API request to create a new document and redirect to the appellant case page', async () => {
			const mockDocumentsEndpoint = nock('http://test/').post('/appeals/1/documents').reply(200);

			const addDocumentsResponse = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-documents/1`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-documents/1/check-your-answers`)
				.send({});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/appellant-case'
			);
			expect(mockDocumentsEndpoint.isDone()).toBe(true);
		});

		it('should display a "document added" notification banner on the appellant case page after a document was uploaded', async () => {
			nock('http://test/').post('/appeals/1/documents').reply(200);

			const addDocumentsResponse = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-documents/1`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(addDocumentsResponse.statusCode).toBe(302);

			const checkYourAnswersResponse = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-documents/1/check-your-answers`)
				.send({});

			expect(checkYourAnswersResponse.statusCode).toBe(302);

			const response = await request.get(`${baseUrl}/1${appellantCasePagePath}`);

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: notificationBannerElement,
				skipPrettyPrint: true
			});

			expect(unprettifiedElement.innerHTML).toContain('Success</h3>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Agreement to change description evidence added</p>'
			);
		});
	});

	describe('GET /appellant-case/add-documents/:folderId/:documentId/check-your-answers', () => {
		beforeEach(() => {
			nock.cleanAll();
			nock('http://test/').get('/appeals/1/exists').reply(200, existsResponse).persist();
			nock('http://test/').get(getFolderApiUrl(1)).reply(200, documentFolderInfo).persist();
			nock('http://test/').get('/appeals/documents/1').reply(200, documentFileInfo);
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses)
				.persist();
		});
		afterEach(() => {
			nock.cleanAll();
		});

		it('should render a 500 error page if fileUploadInfo is not present in the session', async () => {
			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}/add-documents/1/1/check-your-answers`
			);

			expect(response.statusCode).toBe(500);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Sorry, there is a problem with the service</h1>'
			);
		});

		it('should render the add documents check and confirm page with summary list row displaying info on the uploaded document', async () => {
			const addDocumentsResponse = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-documents/1/1`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(addDocumentsResponse.statusCode).toBe(302);

			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}/add-documents/1/1/check-your-answers`
			);

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Check your answers</h1>');
			expect(unprettifiedElement.innerHTML).toContain('File</dt>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<a class="govuk-link" href="/documents/APP/Q9999/D/21/351062/download-uncommitted/1/ph0-documentFileInfo.jpeg/2" target="_blank">test-document.txt</a></dd>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				`href="/appeals-service/appeal-details/1/appellant-case/add-documents/${documentFolderInfo.folderId}/1">Change<span class="govuk-visually-hidden"> file test-document.txt</span></a></dd>`
			);
			expect(unprettifiedElement.innerHTML).toContain('Date received</dt>');
			expect(unprettifiedElement.innerHTML).toContain(
				`${dateISOStringToDisplayDate(new Date().toISOString())}</dd>`
			);
			expect(unprettifiedElement.innerHTML).toContain(
				`href="/appeals-service/appeal-details/1/appellant-case/add-document-details/${documentFolderInfo.folderId}/1">Change<span class="govuk-visually-hidden"> test-document.txt date received</span></a></dd>`
			);
			expect(unprettifiedElement.innerHTML).toContain('Redaction status</dt>');
			expect(unprettifiedElement.innerHTML).toContain('No redaction required</dd>');
			expect(unprettifiedElement.innerHTML).toContain('Confirm</button>');
		});
	});

	describe('POST /appellant-case/add-documents/:folderId/:documentId/check-your-answers', () => {
		beforeEach(() => {
			nock.cleanAll();
			nock('http://test/').get('/appeals/1?include=all').reply(200, appealData).persist();

			nock('http://test/').get('/appeals/1/exists').reply(200, existsResponse).persist();
			nock('http://test/').get(getFolderApiUrl(1)).reply(200, documentFolderInfo).persist();
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses)
				.persist();
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataNotValidated);
			nock('http://test/').get('/appeals/documents/1').reply(200, documentFileInfo);
		});
		afterEach(() => {
			nock.cleanAll();
		});

		it('should render a 500 error page if fileUploadInfo is not present in the session', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-documents/1/1/check-your-answers`)
				.send({});

			expect(response.statusCode).toBe(500);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Sorry, there is a problem with the service</h1>'
			);
		});

		it('should send an API request to update the document, redirect to the appellant case page, and display a "Document updated" notification banner', async () => {
			const mockDocumentsEndpoint = nock('http://test/').post('/appeals/1/documents/1').reply(200);

			const addDocumentsResponse = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-documents/1/1`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(addDocumentsResponse.statusCode).toBe(302);

			const checkYourAnswersResponse = await request
				.post(`${baseUrl}/1${appellantCasePagePath}/add-documents/1/1/check-your-answers`)
				.send({});

			expect(checkYourAnswersResponse.statusCode).toBe(302);
			expect(checkYourAnswersResponse.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/appellant-case'
			);
			expect(mockDocumentsEndpoint.isDone()).toBe(true);

			const appellantCaseResponse = await request.get(`${baseUrl}/1${appellantCasePagePath}`);

			expect(appellantCaseResponse.statusCode).toBe(200);

			const notificationBannerElementHTML = parseHtml(appellantCaseResponse.text, {
				rootElement: notificationBannerElement
			}).innerHTML;

			expect(notificationBannerElementHTML).toContain('Success</h3>');
			expect(notificationBannerElementHTML).toContain(
				'Agreement to change description evidence updated</p>'
			);
		});
	});
});
