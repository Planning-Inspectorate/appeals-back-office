// @ts-nocheck
import supertest from 'supertest';
import { createTestEnvironment } from '#testing/index.js';
import {
	activeDirectoryUsersData,
	appealData,
	fileUploadInfo
} from '#testing/app/fixtures/referencedata.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import { folderInfoResponse } from '@pins/appeals.api/src/server/tests/documents/mocks.js';
import usersService from '#appeals/appeal-users/users-service.js';
import { jest } from '@jest/globals';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';
const appealId = appealData.appealId.toString();
const folderId = folderInfoResponse.folderId;

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
		nock('http://test/').post(`/appeals/${appealId}/documents`).reply(200, {}).persist();
		nock('http://test/')
			.get(`/appeals/${appealId}/document-folders/${folderId}`)
			.reply(200, folderInfoResponse)
			.persist();
		nock('http://test/')
			.get('/appeals/document-redaction-statuses')
			.reply(200, [{ key: 'no_redaction_required', id: 10 }])
			.persist();
	});

	afterEach(() => {
		teardown();
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

			const checkYourAnswersResponse = await request
				.post(`${baseUrl}/${appealId}/environmental-assessment/check-your-answers/${folderId}`)
				.send({});

			expect(checkYourAnswersResponse.statusCode).toBe(302);
			expect(checkYourAnswersResponse.text).toBe(`Found. Redirecting to ${baseUrl}/${appealId}`);

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
});
