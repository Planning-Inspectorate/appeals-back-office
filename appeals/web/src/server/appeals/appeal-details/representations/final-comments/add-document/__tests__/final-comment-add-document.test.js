import { parseHtml } from '@pins/platform';
import { createTestEnvironment } from '#testing/index.js';
import { jest } from '@jest/globals';
import supertest from 'supertest';
import nock from 'nock';
import {
	appealData,
	shareRepsResponseFinalComment,
	appellantFinalCommentsAwaitingReview,
	lpaFinalCommentsAwaitingReview,
	caseNotes,
	activeDirectoryUsersData,
	costsFolderInfoAppellantApplication,
	documentRedactionStatuses,
	fileUploadInfo,
	finalCommentsForReviewWithAttachments
} from '#testing/app/fixtures/referencedata.js';
import usersService from '#appeals/appeal-users/users-service.js';
import { APPEAL_REDACTED_STATUS } from 'pins-data-model';

const { app, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';
const appealId = 1;

describe('add-documents', () => {
	afterEach(teardown);
	describe('GET /share', () => {
		const appealWithFinalComments = {
			...appealData,
			...appealId,
			appealStatus: 'final_comments'
		};

		it('should render a display name for a final comment supporting doc in the audit trail', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, appealWithFinalComments)
				.persist();
			nock('http://test/')
				.get(`/appeals/${appealId}/reps?type=lpa_final_comment`)
				.reply(200, finalCommentsForReviewWithAttachments)
				.persist();
			nock('http://test/')
				.get(`/appeals/${appealId}/document-folders?path=representation/representationAttachments`)
				.reply(200, [{ folderId: 1234, path: 'representation/attachments' }])
				.persist();
			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses)
				.persist();
			nock('http://test/').post(`/appeals/${appealId}/documents`).reply(200);

			const addDocumentsResponse = await request
				.post(`${baseUrl}/${appealId}/final-comments/lpa/add-document`)
				.send({
					'upload-info': fileUploadInfo
				});
			expect(addDocumentsResponse.statusCode).toBe(302);

			const getRedactionStatusResponse = await request.get(
				`${baseUrl}/${appealId}/final-comments/lpa/add-document/redaction-status`
			);
			expect(getRedactionStatusResponse.statusCode).toBe(200);

			const postRedactionStatusResponse = await request
				.post(`${baseUrl}/${appealId}/final-comments/lpa/add-document/redaction-status`)
				.send({ redactionStatus: APPEAL_REDACTED_STATUS.NO_REDACTION_REQUIRED });
			expect(postRedactionStatusResponse.statusCode).toBe(302);

			const postCheckAndConfirmResponse = await request
				.post(`${baseUrl}/${appealId}/final-comments/lpa/add-document/check-your-answers`)
				.send({});
			expect(postCheckAndConfirmResponse.statusCode).toBe(302);

			// expect(postCheckAndConfirmResponse.text).toBe(
			// 	'Found. Redirecting to /appeals-service/appeal-details/1'
			// );
		});
	});
});
