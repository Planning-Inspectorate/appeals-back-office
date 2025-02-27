import { jest } from '@jest/globals';
import {
	appealDataFullPlanning,
	costsFolderInfoAppellantApplication,
	documentFileInfo,
	documentFileVersionsInfo,
	documentFolderInfo,
	documentRedactionStatuses,
	finalCommentsForReview,
	interestedPartyCommentForReview,
	activeDirectoryUsersData
} from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';
import usersService from '#appeals/appeal-users/users-service.js';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';

describe('lpa-statements', () => {
	beforeEach(() => {
		installMockApi();
		// Common nock setup
		nock('http://test/')
			.get('/appeals/2')
			.reply(200, {
				...appealDataFullPlanning,
				appealId: 2,
				appealStatus: 'statements'
			});

		nock('http://test/')
			.get('/appeals/2/document-folders')
			.query({ path: 'representation/representationAttachments' })
			.reply(200, [{ folderId: 1234, path: 'representation/attachments' }]);

		nock('http://test/')
			.get('/appeals/2/reps?type=lpa_statement')
			.reply(200, finalCommentsForReview)
			.persist();

		nock('http://test/')
			.get('/appeals/2/document-folders?path=representation/representationAttachments')
			.reply(200, [{ folderId: 1234, path: 'representation/attachments' }]);
	});

	afterEach(teardown);

	describe('GET /manage-documents/:folderId/', () => {
		beforeEach(() => {
			nock('http://test/').get('/appeals/2/reps/5').reply(200, interestedPartyCommentForReview);

			nock('http://test/')
				.get('/appeals/2/document-folders/1')
				.reply(200, costsFolderInfoAppellantApplication)
				.persist();

			nock('http://test/').get('/appeals/2/documents/1').reply(200, documentFileInfo);

			nock('http://test/')
				.get('/appeals/2/reps?type=lpa_final_comment')
				.reply(200, finalCommentsForReview);
		});

		it('should render a 404 error page if the folderId is invalid', async () => {
			nock('http://test/').get('/appeals/2/document-folders/99').reply(404);

			const response = await request.get(`${baseUrl}/2/lpa-statement/manage-documents/99`);

			expect(response.statusCode).toBe(404);

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Page not found</h1>');
		});

		it('should render manage folder page with the provided comment details', async () => {
			const response = await request.get(`${baseUrl}/2/lpa-statement/manage-documents/1`);

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Manage folder</span><h1');
			expect(unprettifiedElement.innerHTML).toContain('Supporting documents</h1>');
			expect(unprettifiedElement.innerHTML).toContain('Name</th>');
			expect(unprettifiedElement.innerHTML).toContain('Date submitted</th>');
			expect(unprettifiedElement.innerHTML).toContain('Redaction status</th>');
			expect(unprettifiedElement.innerHTML).toContain('Actions</th>');

			expect(unprettifiedElement.innerHTML).toContain('test-pdf-documentFolderInfo.pdf</span>');
		});
	});

	describe('GET /manage-documents/:folderId/:documentId', () => {
		beforeEach(() => {
			// @ts-ignore
			usersService.getUsersByRole = jest.fn().mockResolvedValue(activeDirectoryUsersData);
			// @ts-ignore
			usersService.getUserByRoleAndId = jest.fn().mockResolvedValue(activeDirectoryUsersData[0]);
			// @ts-ignore
			usersService.getUserById = jest.fn().mockResolvedValue(activeDirectoryUsersData[0]);

			nock('http://test/')
				.get('/appeals/2/documents/1/versions')
				.reply(200, documentFileVersionsInfo);

			nock('http://test/').get('/appeals/2/reps/5').reply(200, interestedPartyCommentForReview);

			nock('http://test/')
				.get('/appeals/2/document-folders/1')
				.reply(200, costsFolderInfoAppellantApplication)
				.persist();

			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses);

			nock('http://test/')
				.get('/appeals/2/document-folders/1')
				.reply(200, documentFolderInfo)
				.persist();

			nock('http://test/').get('/appeals/2/documents/1').reply(200, documentFileInfo);
		});

		it('should render a 404 error page if the folderId is invalid', async () => {
			nock('http://test/').get('/appeals/2/document-folders/99').reply(404);

			const response = await request.get(`${baseUrl}/2/lpa-statement/manage-documents/1/99`);

			expect(response.statusCode).toBe(404);

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Page not found</h1>');
		});

		it('should render manage document page with the provided comment details', async () => {
			const response = await request.get(`${baseUrl}/2/lpa-statement/manage-documents/1/1`);

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Manage versions</span><h1');
			expect(unprettifiedElement.innerHTML).toContain('test-pdf-documentFileVersionsInfo.pdf</h1>');
			expect(unprettifiedElement.innerHTML).toContain('Virus scanning</strong>');
			expect(unprettifiedElement.innerHTML).not.toContain('Virus detected</strong>');
			expect(unprettifiedElement.innerHTML).not.toContain(
				'test-pdf-documentFileVersionsInfo.pdf</a>'
			);
			expect(unprettifiedElement.innerHTML).not.toContain('Upload a new version</a>');
			expect(unprettifiedElement.innerHTML).not.toContain('Remove current version</a>');
		});
	});

	describe('GET change-document-name/:folderId/:documentId', () => {
		beforeEach(() => {
			nock('http://test/')
				.get('/appeals/2')
				.reply(200, {
					...appealDataFullPlanning,
					appealId: 2,
					appealStatus: 'statements'
				});

			nock('http://test/').get('/appeals/2/reps/5').reply(200, interestedPartyCommentForReview);

			nock('http://test/')
				.get('/appeals/2/document-folders/1')
				.reply(200, costsFolderInfoAppellantApplication)
				.persist();

			nock('http://test/').get('/appeals/2/documents/1').reply(200, documentFileInfo);
		});

		it('should render change document page with the provided comment details', async () => {
			const response = await request.get(
				`${baseUrl}/2/lpa-statement/manage-documents/change-document-name/1/1`
			);

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Change document details</span><h1');
			expect(unprettifiedElement.innerHTML).toContain('File name');
			expect(unprettifiedElement.innerHTML).toContain('value="ph0-documentFileInfo.jpeg">');
		});
	});

	describe('GET change-document-details/:folderId/:documentId', () => {
		beforeEach(() => {
			nock('http://test/')
				.get('/appeals/2')
				.reply(200, {
					...appealDataFullPlanning,
					appealId: 2,
					appealStatus: 'statements'
				});

			nock('http://test/')
				.get('/appeals/2/documents/1/versions')
				.reply(200, documentFileVersionsInfo);

			nock('http://test/').get('/appeals/2/reps/5').reply(200, interestedPartyCommentForReview);

			nock('http://test/')
				.get('/appeals/2/document-folders/1')
				.reply(200, costsFolderInfoAppellantApplication)
				.persist();

			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses);

			nock('http://test/')
				.get('/appeals/2/document-folders/1')
				.reply(200, documentFolderInfo)
				.persist();

			nock('http://test/').get('/appeals/2/documents/1').reply(200, documentFileInfo);
		});

		it('should render change document details page with the provided comment details', async () => {
			const response = await request.get(
				`${baseUrl}/2/lpa-statement/manage-documents/change-document-details/1/1`
			);

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Change document details</span><h1');
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

		describe('GET /add-document', () => {
			beforeEach(() => {
				nock('http://test/').get('/appeals/2/reps').reply(200, interestedPartyCommentForReview);

				nock('http://test/')
					.get('/appeals/3619/reps?type=lpa_statement')
					.reply(200, finalCommentsForReview);
			});

			it('should render the add document details page', async () => {
				const response = await request.get(`${baseUrl}/2/lpa-statement/add-document`);
				expect(response.statusCode).toBe(200);
				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });
				expect(unprettifiedElement.innerHTML).toContain('Upload supporting document</h1');
			});

			it('should render the redaction status page', async () => {
				const response = await request.get(
					`${baseUrl}/2/lpa-statement/add-document/redaction-status`
				);
				expect(response.statusCode).toBe(200);
				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });
				expect(unprettifiedElement.innerHTML).toContain('Redaction status</h1');
			});

			it('should render the date submitted page', async () => {
				const response = await request.get(
					`${baseUrl}/2/lpa-statement/add-document/date-submitted`
				);
				expect(response.statusCode).toBe(200);
				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });
				expect(unprettifiedElement.innerHTML).toContain(
					'When was the supporting document submitted?</h1'
				);
			});
		});
	});
});
