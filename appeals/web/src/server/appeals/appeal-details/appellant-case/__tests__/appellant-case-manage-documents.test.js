import usersService from '#appeals/appeal-users/users-service.js';

import {
	activeDirectoryUsersData,
	additionalDocumentsFolderInfo,
	appealData,
	documentFileInfo,
	documentFileMultipleVersionsInfoWithLatestAsLateEntry,
	documentFileVersionsInfo,
	documentFileVersionsInfoChecked,
	documentFileVersionsInfoNotChecked,
	documentFileVersionsInfoVirusFound,
	documentFolderInfo,
	documentRedactionStatuses
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
	id: appealData.appealId,
	appealId: appealData.appealId,
	appealReference: appealData.appealReference
};

/**
 * @param {number} folderId
 */
const getFolderApiUrl = (folderId) =>
	`/appeals/1/document-folders/${folderId}?pageNumber=1&pageSize=100`;

describe('appellant-case manage-documents', () => {
	afterAll(() => {
		nock.cleanAll();
		nock.restore();
		jest.clearAllMocks();
	});
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('GET /appellant-case/manage-documents/:folderId/', () => {
		beforeEach(() => {
			nock.cleanAll();
			// @ts-ignore
			usersService.getUserByRoleAndId = jest.fn().mockResolvedValue(activeDirectoryUsersData[0]);
			nock('http://test/').get('/appeals/1?include=appealType').reply(200, appealData).persist();
			nock('http://test/').get('/appeals/1/exists').reply(200, existsResponse).persist();
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses)
				.persist();
		});
		afterEach(() => {
			nock.cleanAll();
		});

		it('should render a 404 error page if the folderId is not valid', async () => {
			nock('http://test/').get(getFolderApiUrl(1)).reply(200, documentFolderInfo);
			nock('http://test/').get('/appeals/documents/1').reply(200, documentFileInfo);

			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}/manage-documents/99/`
			);

			expect(response.statusCode).toBe(404);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Page not found</h1>');
		});

		it('should render the manage documents listing page with one document item for each document present in the folder, if the folderId is valid', async () => {
			nock('http://test/')
				.get(getFolderApiUrl(1))
				.reply(200, { ...documentFolderInfo, path: 'appellant-case/appellantStatement' });

			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}/manage-documents/1/`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Manage folder</span><h1');
			expect(unprettifiedElement.innerHTML).toContain('Appellant statement documents</h1>');
			expect(unprettifiedElement.innerHTML).toContain('Name</th>');
			expect(unprettifiedElement.innerHTML).toContain('Date received</th>');
			expect(unprettifiedElement.innerHTML).toContain('Redaction status</th>');
			expect(unprettifiedElement.innerHTML).toContain('Actions</th>');
			expect(unprettifiedElement.innerHTML).toContain('test-pdf-documentFolderInfo.pdf</span>');
			expect(unprettifiedElement.innerHTML).toContain('sample-20s-documentFolderInfo.mp4</span>');
			expect(unprettifiedElement.innerHTML).toContain('ph0-documentFolderInfo.jpeg</span>');
			expect(unprettifiedElement.innerHTML).toContain('ph1-documentFolderInfo.jpeg</a>');
			expect(unprettifiedElement.innerHTML).toContain(
				`<a href="/appeals-service/appeal-details/1/appellant-case/add-documents/${documentFolderInfo.folderId}" role="button" draggable="false" class="govuk-button govuk-button--secondary" data-module="govuk-button"> Add document</a>`
			);
		});

		it('should hide the add document button and actions column when the user cannot update the case', async () => {
			const { app: readOnlyApp, teardown: readOnlyTeardown } = createTestEnvironment({
				groups: []
			});
			const readOnlyRequest = supertest(readOnlyApp);

			try {
				nock('http://test/')
					.get(getFolderApiUrl(1))
					.reply(200, { ...documentFolderInfo, path: 'appellant-case/appellantStatement' });

				const response = await readOnlyRequest.get(
					`${baseUrl}/1${appellantCasePagePath}/manage-documents/1/`
				);
				expect(response.statusCode).toBe(200);

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Name</th>');
				expect(unprettifiedElement.innerHTML).toContain('Date received</th>');
				expect(unprettifiedElement.innerHTML).toContain('Redaction status</th>');
				expect(unprettifiedElement.innerHTML).not.toContain('Actions</th>');
				expect(unprettifiedElement.innerHTML).not.toContain('Add document</a>');
			} finally {
				readOnlyTeardown();
			}
		});

		it('should render the manage documents listing page with the expected heading, if the folderId is valid, and the folder is additional documents', async () => {
			nock('http://test/').get(getFolderApiUrl(2)).reply(200, additionalDocumentsFolderInfo);

			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}/manage-documents/2/`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Manage folder</span><h1');
			expect(unprettifiedElement.innerHTML).toContain('Additional documents</h1>');
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
			'should render the manage documents listing page with the expected heading, if the folderId is valid, and the folder is changed description for appeal type %s',
			async (_, appealType, expectedText) => {
				nock.cleanAll(); // need to remove the nocks so we can change the appeal type
				// @ts-ignore
				usersService.getUserByRoleAndId = jest.fn().mockResolvedValue(activeDirectoryUsersData[0]);
				nock('http://test/').get('/appeals/1/exists').reply(200, existsResponse).persist();

				nock('http://test/')
					.get('/appeals/document-redaction-statuses')
					.reply(200, documentRedactionStatuses);
				nock('http://test/')
					.get('/appeals/1?include=appealType')
					.reply(200, { appealType: appealType })
					.persist();
				nock('http://test/').get(getFolderApiUrl(3)).reply(200, documentFolderInfo);

				const response = await request.get(
					`${baseUrl}/1${appellantCasePagePath}/manage-documents/3/`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Manage folder</span><h1');
				expect(unprettifiedElement.innerHTML).toContain(expectedText);
			}
		);
	});

	describe('GET /appellant-case/manage-documents/:folderId/:documentId', () => {
		beforeEach(() => {
			// @ts-ignore
			usersService.getUsersByRole = jest.fn().mockResolvedValue(activeDirectoryUsersData);
			// @ts-ignore
			usersService.getUserByRoleAndId = jest.fn().mockResolvedValue(activeDirectoryUsersData[0]);
			// @ts-ignore
			usersService.getUserById = jest.fn().mockResolvedValue(activeDirectoryUsersData[0]);

			nock('http://test/').get('/appeals/1/exists').reply(200, existsResponse).persist();
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses);
			nock('http://test/').get(getFolderApiUrl(1)).reply(200, documentFolderInfo).persist();
			nock('http://test/').get('/appeals/documents/1').reply(200, documentFileInfo).persist();
		});

		it('should render a 404 error page if the folderId is not valid', async () => {
			nock('http://test/')
				.get('/appeals/documents/1/versions')
				.reply(200, documentFileVersionsInfo);

			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}/manage-documents/99/1`
			);

			expect(response.statusCode).toBe(404);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Page not found</h1>');
		});

		it('should render a 404 error page if the documentId is not valid', async () => {
			nock('http://test/')
				.get('/appeals/documents/1/versions')
				.reply(200, documentFileVersionsInfo);

			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}/manage-documents/1/99`
			);

			expect(response.statusCode).toBe(404);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Page not found</h1>');
		});

		it('should render the manage individual document page with the expected content if the folderId and documentId are both valid and the document virus check status is null', async () => {
			nock('http://test/')
				.get('/appeals/documents/1/versions')
				.reply(200, documentFileVersionsInfo);

			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}/manage-documents/1/1`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Manage document</span><h1');
			expect(unprettifiedElement.innerHTML).toContain('test-pdf-documentFileVersionsInfo.pdf</h1>');
			expect(unprettifiedElement.innerHTML).toContain('Virus scanning</strong>');
			expect(unprettifiedElement.innerHTML).toContain('Version</dt>');
			expect(unprettifiedElement.innerHTML).toContain('Date received</dt>');
			expect(unprettifiedElement.innerHTML).toContain('Redaction status</dt>');
			expect(unprettifiedElement.innerHTML).toContain('Document versions</h2>');
			expect(unprettifiedElement.innerHTML).toContain('Version history</span>');
			expect(unprettifiedElement.innerHTML).toContain('Version</th>');
			expect(unprettifiedElement.innerHTML).toContain('Name</th>');
			expect(unprettifiedElement.innerHTML).toContain('Activity</th>');
			expect(unprettifiedElement.innerHTML).toContain('Redaction status</th>');
			expect(unprettifiedElement.innerHTML).toContain('Action</th>');
			expect(unprettifiedElement.innerHTML).not.toContain('Virus detected</strong>');
			expect(unprettifiedElement.innerHTML).not.toContain(
				'test-pdf-documentFileVersionsInfo.pdf</a>'
			);
			expect(unprettifiedElement.innerHTML).not.toContain('Upload a new version</a>');
			expect(unprettifiedElement.innerHTML).not.toContain('Remove current version</a>');
		});

		it('should render the manage individual document page with the expected content if the folderId and documentId are both valid and the document virus check status is "not_scanned"', async () => {
			nock('http://test/')
				.get('/appeals/documents/1/versions')
				.reply(200, documentFileVersionsInfoNotChecked);

			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}/manage-documents/1/1`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Manage document</span><h1');
			expect(unprettifiedElement.innerHTML).toContain('test-pdf-documentFileVersionsInfo.pdf</h1>');
			expect(unprettifiedElement.innerHTML).toContain('Virus scanning</strong>');
			expect(unprettifiedElement.innerHTML).not.toContain('Virus detected</strong>');
			expect(unprettifiedElement.innerHTML).not.toContain(
				'test-pdf-documentFileVersionsInfo.pdf</a>'
			);
			expect(unprettifiedElement.innerHTML).not.toContain('Upload a new version</a>');
			expect(unprettifiedElement.innerHTML).not.toContain('Remove current version</a>');
		});

		it('should render the manage individual document page with the expected content if the folderId and documentId are both valid and the document virus check status is "affected"', async () => {
			nock('http://test/')
				.get('/appeals/documents/1/versions')
				.reply(200, documentFileVersionsInfoVirusFound);

			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}/manage-documents/1/1`
			);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Manage document</span><h1');
			expect(unprettifiedElement.innerHTML).toContain('test-pdf-documentFileVersionsInfo.pdf</h1>');
			expect(unprettifiedElement.innerHTML).toContain('class="govuk-error-summary"');
			expect(unprettifiedElement.innerHTML).toContain('There is a problem</h2>');
			expect(unprettifiedElement.innerHTML).toContain(
				'The selected file contains a virus. Upload a different version.</a>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Virus detected</strong>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Upload a new version<span class="govuk-visually-hidden"> of test-pdf-documentFileVersionsInfo.pdf</span></a>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Remove current version<span class="govuk-visually-hidden"> of test-pdf-documentFileVersionsInfo.pdf</span></a>'
			);
			expect(unprettifiedElement.innerHTML).not.toContain('Virus scanning</strong>');
			expect(unprettifiedElement.innerHTML).not.toContain(
				'test-pdf-documentFileVersionsInfo.pdf</a>'
			);
		});

		it('should render the manage individual document page with the expected content if the folderId and documentId are both valid and the document virus check status is "scanned"', async () => {
			nock('http://test/')
				.get('/appeals/documents/1/versions')
				.reply(200, documentFileVersionsInfoChecked);

			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}/manage-documents/1/1`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Manage document</span><h1');
			expect(unprettifiedElement.innerHTML).toContain('test-pdf-documentFileVersionsInfo.pdf</h1>');
			expect(unprettifiedElement.innerHTML).toContain('test-pdf-documentFileVersionsInfo.pdf</a>');
			expect(unprettifiedElement.innerHTML).toContain(
				'Upload a new version<span class="govuk-visually-hidden"> of test-pdf-documentFileVersionsInfo.pdf</span></a>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Remove current version<span class="govuk-visually-hidden"> of test-pdf-documentFileVersionsInfo.pdf</span></a>'
			);
			expect(unprettifiedElement.innerHTML).not.toContain('Virus detected</strong>');
			expect(unprettifiedElement.innerHTML).not.toContain('Virus scanning</strong>');
		});

		it('should render the manage individual document page without late entry tag in the date received row if the latest version of the document is not marked as late entry', async () => {
			nock('http://test/')
				.get('/appeals/documents/1/versions')
				.reply(200, documentFileVersionsInfo);

			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}/manage-documents/1/1`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Manage document</span><h1');
			expect(unprettifiedElement.innerHTML).not.toContain('Late entry</strong>');
		});

		it('should render the manage individual document page with late entry tag in the date received row if the latest version of the document is marked as late entry, and a document history item for each version, with late entry tag in the history item document name column for versions marked as late entry', async () => {
			nock('http://test/')
				.get('/appeals/documents/1/versions')
				.reply(200, documentFileMultipleVersionsInfoWithLatestAsLateEntry);

			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}/manage-documents/1/1`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Manage document</span><h1');
			expect(unprettifiedElement.innerHTML).toContain('Late entry</strong>');
		});
	});

	describe('GET /appellant-case/manage-documents/:folderId/:documentId/:versionId/delete', () => {
		beforeEach(() => {
			nock('http://test/').get('/appeals/1/exists').reply(200, existsResponse).persist();
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses);
			nock('http://test/').get(getFolderApiUrl(1)).reply(200, documentFolderInfo);
			nock('http://test/').get('/appeals/documents/1').reply(200, documentFileInfo);
		});

		it('should render the delete document page with the expected content when there is a single document version', async () => {
			nock('http://test/')
				.get('/appeals/documents/1/versions')
				.reply(200, documentFileVersionsInfoChecked);

			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}/manage-documents/1/1/1/delete`
			);

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Manage versions</span><h1');
			expect(unprettifiedElement.innerHTML).toContain(
				'Are you sure you want to remove this version?</h1>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'<strong class="govuk-warning-text__text"><span class="govuk-visually-hidden">Warning</span> Removing the only version of a document will delete the document from the case</strong>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="delete-file-answer" type="radio" value="yes">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="delete-file-answer" type="radio" value="no">'
			);
		});

		it('should render the delete document page with the expected content when there are multiple document versions', async () => {
			const multipleVersionsDocument = structuredClone(documentFileVersionsInfoChecked);
			multipleVersionsDocument.allVersions.push(multipleVersionsDocument.allVersions[0]);

			nock('http://test/')
				.get('/appeals/documents/1/versions')
				.reply(200, multipleVersionsDocument);

			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}/manage-documents/1/1/1/delete`
			);

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Manage versions</span><h1');
			expect(unprettifiedElement.innerHTML).toContain(
				'Are you sure you want to remove this version?</h1>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="delete-file-answer" type="radio" value="yes">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="delete-file-answer" type="radio" value="no">'
			);
			expect(unprettifiedElement.innerHTML).not.toContain(
				'<strong class="govuk-warning-text__text"><span class="govuk-visually-hidden">Warning</span> Removing the only version of a document will delete the document from the case</strong>'
			);
		});
	});
});
