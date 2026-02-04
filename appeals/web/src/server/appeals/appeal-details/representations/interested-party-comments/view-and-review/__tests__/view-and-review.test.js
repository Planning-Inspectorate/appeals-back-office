import usersService from '#appeals/appeal-users/users-service.js';
import {
	activeDirectoryUsersData,
	appealDataFullPlanning,
	costsFolderInfoAppellantApplication,
	documentFileInfo,
	documentFileVersionsInfo,
	documentFolderInfo,
	documentRedactionStatuses,
	interestedPartyCommentForReview,
	interestedPartyCommentForView,
	interestedPartyCommentsForReview,
	interestedPartyCommentsForView,
	representationRejectionReasons
} from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { jest } from '@jest/globals';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';

describe('interested-party-comments', () => {
	beforeEach(() => {
		installMockApi();

		// Common nock setup
		nock('http://test/')
			.get('/appeals/2?include=all')
			.reply(200, {
				...appealDataFullPlanning,
				appealId: 2,
				appealStatus: 'statements'
			});

		nock('http://test/')
			.get('/appeals/2/document-folders?path=representation/representationAttachments')
			.reply(200, [{ folderId: 1234, path: 'representation/attachments' }]);

		nock('http://test/')
			.get('/appeals/2/document-folders/1?repId=3670')
			.reply(200, costsFolderInfoAppellantApplication)
			.persist();

		jest
			.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] })
			.setSystemTime(new Date('2025-08-26'));
	});

	afterEach(teardown);

	describe('GET /review-comment with data', () => {
		beforeEach(() => {
			nock('http://test/').get('/appeals/2/reps/5').reply(200, interestedPartyCommentForReview);
			nock('http://test/')
				.get('/appeals/2/reps?type=comment')
				.reply(200, interestedPartyCommentsForReview);
		});

		it('should render review comment page with the provided comment details', async () => {
			const response = await request.get(`${baseUrl}/2/interested-party-comments/5/review`);

			expect(response.statusCode).toBe(200);

			const dom = parseHtml(response.text);
			const elementInnerHtml = dom.innerHTML;
			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('Review comment</h1>');

			const interestedPartyRow = parseHtml(response.text, {
				rootElement: '.govuk-summary-list__row:first-of-type'
			});

			expect(interestedPartyRow).not.toBeNull();
			const partyKey = interestedPartyRow?.querySelector('.govuk-summary-list__key');
			const partyValue = interestedPartyRow?.querySelector('.govuk-summary-list__value');
			expect(partyKey?.textContent?.trim()).toBe('Interested party');
			expect(partyValue?.textContent?.trim()).toBe('Lee Thornton');
		});

		it('should render review comment page with email not provided', async () => {
			const testComment = structuredClone(interestedPartyCommentForReview);
			testComment.represented.email = '';

			nock('http://test/').get('/appeals/2/reps/55').reply(200, testComment);
			const response = await request.get(`${baseUrl}/2/interested-party-comments/55/review`);

			expect(response.statusCode).toBe(200);

			const dom = parseHtml(response.text);
			const elementInnerHtml = dom.innerHTML;
			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('Review comment</h1>');

			const interestedPartyRow = parseHtml(response.text, {
				rootElement: '.govuk-summary-list__row:first-of-type'
			});

			expect(interestedPartyRow).not.toBeNull();
			const partyKey = interestedPartyRow?.querySelector('.govuk-summary-list__key');
			const partyValue = interestedPartyRow?.querySelector('.govuk-summary-list__value');
			expect(partyKey?.textContent?.trim()).toBe('Interested party');
			expect(partyValue?.textContent?.trim()).toBe('Lee Thornton');
		});

		it('should render review comment page with redact and accept radio button hidden when no comment provided', async () => {
			const testComment = structuredClone(interestedPartyCommentForReview);
			testComment.originalRepresentation = '';

			nock('http://test/').get('/appeals/2/reps/55').reply(200, testComment);
			const response = await request.get(`${baseUrl}/2/interested-party-comments/55/review`);

			expect(response.statusCode).toBe(200);

			const dom = parseHtml(response.text);
			const elementInnerHtml = dom.innerHTML;
			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('Review comment</h1>');

			const interestedPartyRow = parseHtml(response.text, {
				rootElement: '.govuk-summary-list__row:first-of-type'
			});

			expect(interestedPartyRow).not.toBeNull();
			const partyKey = interestedPartyRow?.querySelector('.govuk-summary-list__key');
			const partyValue = interestedPartyRow?.querySelector('.govuk-summary-list__value');
			expect(partyKey?.textContent?.trim()).toBe('Interested party');
			expect(partyValue?.textContent?.trim()).toBe('Lee Thornton');
			expect(elementInnerHtml).not.toContain('Redact and accept comment');
		});
	});

	describe('GET /review-comment with no data', () => {
		beforeEach(() => {
			nock('http://test/').get('/appeals/2/reps/comments/999').reply(404, {});
		});

		it('should render 404 page when the comment is not found', async () => {
			const response = await request.get(`${baseUrl}/2/review/999`);

			expect(response.statusCode).toBe(404);

			const elementInnerHtml = parseHtml(response.text).innerHTML;
			expect(elementInnerHtml).toContain('Page not found');
		});
	});

	describe('GET /view-comment with data', () => {
		beforeEach(() => {
			nock('http://test/').get('/appeals/2/reps/5').reply(200, interestedPartyCommentForView);

			nock('http://test/')
				.get('/appeals/2/reps?type=comment')
				.reply(200, interestedPartyCommentsForView);
		});

		it('should render view comment page with the provided comment details', async () => {
			const response = await request.get(`${baseUrl}/2/interested-party-comments/5/view`);

			expect(response.statusCode).toBe(200);

			const dom = parseHtml(response.text);
			const elementInnerHtml = dom.innerHTML;
			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('View comment</h1>');

			const interestedPartyRow = parseHtml(response.text, {
				rootElement: '.govuk-summary-list__row:first-of-type'
			});

			expect(interestedPartyRow).not.toBeNull();
			const partyKey = interestedPartyRow?.querySelector('.govuk-summary-list__key');
			const partyValue = interestedPartyRow?.querySelector('.govuk-summary-list__value');
			expect(partyKey?.textContent?.trim()).toBe('Interested party');
			expect(partyValue?.textContent?.trim()).toBe('Lee Thornton');
		});
	});

	describe('GET /view-comment with no data', () => {
		beforeEach(() => {
			nock('http://test/').get('/appeals/2/reps/comments/999').reply(404, {});
		});

		it('should render 404 page when the comment is not found', async () => {
			const response = await request.get(`${baseUrl}/2/view/999`);

			expect(response.statusCode).toBe(404);

			const elementInnerHtml = parseHtml(response.text).innerHTML;
			expect(elementInnerHtml).toContain('Page not found');
		});
	});

	describe('POST /review', () => {
		beforeEach(() => {
			nock('http://test/').get('/appeals/2/reps/5').reply(200, interestedPartyCommentForReview);
			nock('http://test/').patch('/appeals/2/reps/5').reply(200, {});
			nock('http://test/')
				.get('/appeals/2/reps?type=comment')
				.reply(200, interestedPartyCommentsForReview);
		});

		it('should set representation status to valid', async () => {
			const response = await request
				.post(`${baseUrl}/2/interested-party-comments/5/review`)
				.send({ status: 'valid' });

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/2/interested-party-comments'
			);
		});
	});

	describe('GET /reject/select-reason', () => {
		beforeEach(() => {
			nock('http://test/').get('/appeals/2/reps/5').reply(200, interestedPartyCommentForReview);
			nock('http://test')
				.get('/appeals/representation-rejection-reasons?type=comment')
				.reply(200, representationRejectionReasons);
			nock('http://test/')
				.get('/appeals/2/reps?type=comment')
				.reply(200, interestedPartyCommentsForReview);
		});

		it('should render reject comment page', async () => {
			const response = await request.get(
				`${baseUrl}/2/interested-party-comments/5/reject/select-reason`
			);

			expect(response.statusCode).toBe(200);

			const dom = parseHtml(response.text);
			const elementInnerHtml = dom.innerHTML;
			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('Why are you rejecting the comment?</h1>');
		});

		it('should render the correct back link', async () => {
			const response = await request.get(
				`${baseUrl}/2/interested-party-comments/5/reject/select-reason`
			);

			expect(response.statusCode).toBe(200);

			const page = parseHtml(response.text, { rootElement: 'body' });
			expect(page.querySelector('.govuk-back-link')?.getAttribute('href')).toBe(
				`${baseUrl}/2/interested-party-comments/3670/review`
			);
		});

		it('should render the correct back link when editing', async () => {
			const response = await request.get(
				`${baseUrl}/2/interested-party-comments/5/reject/select-reason` +
					`?editEntrypoint=${baseUrl}/2/interested-party-comments/5/reject/select-reason`
			);

			expect(response.statusCode).toBe(200);

			const page = parseHtml(response.text, { rootElement: 'body' });
			expect(page.querySelector('.govuk-back-link')?.getAttribute('href')).toBe(
				`${baseUrl}/2/interested-party-comments/3670/reject/check-your-answers`
			);
		});
	});

	describe('GET /reject/allow-resubmit', () => {
		beforeEach(() => {
			nock('http://test/').get('/appeals/2/reps/5').reply(200, interestedPartyCommentForReview);
			nock('http://test/')
				.post('/appeals/add-business-days')
				.reply(200, JSON.stringify('2024-11-13T00:00:00.000Z'));
			nock('http://test/')
				.get('/appeals/2/reps?type=comment')
				.reply(200, interestedPartyCommentsForReview);
		});

		afterEach(teardown);

		it('should render allow resubmit page', async () => {
			const response = await request.get(
				`${baseUrl}/2/interested-party-comments/5/reject/allow-resubmit`
			);

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Do you want to allow the interested party to resubmit a comment?</h1>'
			);
		});

		it('should render the correct back link', async () => {
			const response = await request.get(
				`${baseUrl}/2/interested-party-comments/5/reject/allow-resubmit`
			);

			expect(response.statusCode).toBe(200);

			const page = parseHtml(response.text, { rootElement: 'body' });
			expect(page.querySelector('.govuk-back-link')?.getAttribute('href')).toBe(
				`${baseUrl}/2/interested-party-comments/3670/reject/select-reason`
			);
		});

		it('should render the correct back link when editing', async () => {
			const response = await request.get(
				`${baseUrl}/2/interested-party-comments/5/reject/allow-resubmit` +
					`?editEntrypoint=${baseUrl}/2/interested-party-comments/5/reject/allow-resubmit`
			);

			expect(response.statusCode).toBe(200);

			const page = parseHtml(response.text, { rootElement: 'body' });
			expect(page.querySelector('.govuk-back-link')?.getAttribute('href')).toBe(
				`${baseUrl}/2/interested-party-comments/3670/reject/check-your-answers`
			);
		});
	});

	describe('GET /reject/check-your-answers', () => {
		beforeEach(() => {
			nock('http://test/').get('/appeals/2/reps/5').reply(200, interestedPartyCommentForReview);
			nock('http://test')
				.get('/appeals/representation-rejection-reasons?type=comment')
				.reply(200, representationRejectionReasons);
			nock('http://test/')
				.get('/appeals/2/reps?type=comment')
				.reply(200, interestedPartyCommentsForReview);
		});

		afterEach(teardown);

		it('should render check your answers page', async () => {
			const response = await request.get(
				`${baseUrl}/2/interested-party-comments/5/reject/check-your-answers`
			);

			expect(response.statusCode).toBe(200);

			const dom = parseHtml(response.text);
			const innerHtml = dom.innerHTML;

			expect(innerHtml).toMatchSnapshot();
			expect(innerHtml).toContain('Check details and reject comment</h1>');
		});
	});

	describe('GET /manage-documents/:folderId/', () => {
		beforeEach(() => {
			nock('http://test/').get('/appeals/2/reps/5').reply(200, interestedPartyCommentForReview);

			nock('http://test/')
				.get('/appeals/2/document-folders/1')
				.reply(200, costsFolderInfoAppellantApplication)
				.persist();

			nock('http://test/')
				.get('/appeals/2/reps?type=comment')
				.reply(200, interestedPartyCommentsForReview);

			nock('http://test/').get('/appeals/documents/1').reply(200, documentFileInfo);
		});

		it('should render a 404 error page if the folderId is invalid', async () => {
			nock('http://test/').get('/appeals/2/document-folders/99').reply(404);

			const response = await request.get(
				`${baseUrl}/2/interested-party-comments/5/manage-documents/99`
			);

			expect(response.statusCode).toBe(404);

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Page not found</h1>');
		});

		it('should render manage folder page with the provided comment details', async () => {
			const response = await request.get(
				`${baseUrl}/2/interested-party-comments/5/manage-documents/1`
			);

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
			expect(unprettifiedElement.innerHTML).toContain(
				`<a href="/appeals-service/appeal-details/2/interested-party-comments/5/add-document" role="button" draggable="false" class="govuk-button govuk-button--secondary" data-module="govuk-button"> Add document</a>`
			);
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
				.get('/appeals/documents/1/versions')
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

			nock('http://test/')
				.get('/appeals/2/reps?type=comment')
				.reply(200, interestedPartyCommentsForReview);

			nock('http://test/').get('/appeals/documents/1').reply(200, documentFileInfo);
		});

		it('should render a 404 error page if the folderId is invalid', async () => {
			nock('http://test/').get('/appeals/2/document-folders/99').reply(404);

			const response = await request.get(
				`${baseUrl}/2/interested-party-comments/5/manage-documents/1/99`
			);

			expect(response.statusCode).toBe(404);

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Page not found</h1>');
		});

		it('should render manage document page with the provided comment details', async () => {
			const response = await request.get(
				`${baseUrl}/2/interested-party-comments/5/manage-documents/1/1`
			);

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
				.get('/appeals/2?include=all')
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

			nock('http://test/')
				.get('/appeals/2/reps?type=comment')
				.reply(200, interestedPartyCommentsForReview);

			nock('http://test/').get('/appeals/documents/1').reply(200, documentFileInfo);
		});

		it('should render change document page with the provided comment details', async () => {
			const response = await request.get(
				`${baseUrl}/2/interested-party-comments/5/manage-documents/change-document-name/1/1`
			);

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Change document details</span><h1');
			expect(unprettifiedElement.innerHTML).toContain('File name');
			expect(unprettifiedElement.innerHTML).toContain('value="ph0-documentFileInfo">');
		});
	});

	describe('GET change-document-details/:folderId/:documentId', () => {
		beforeEach(() => {
			nock('http://test/')
				.get('/appeals/2?include=all')
				.reply(200, {
					...appealDataFullPlanning,
					appealId: 2,
					appealStatus: 'statements'
				});

			nock('http://test/')
				.get('/appeals/documents/1/versions')
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

			nock('http://test/')
				.get('/appeals/2/reps?type=comment')
				.reply(200, interestedPartyCommentsForReview);

			nock('http://test/').get('/appeals/documents/1').reply(200, documentFileInfo);
		});

		it('should render change document details page with the provided comment details', async () => {
			const response = await request.get(
				`${baseUrl}/2/interested-party-comments/5/manage-documents/change-document-details/1/1`
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
	});

	describe('GET /add-document', () => {
		beforeEach(() => {
			nock('http://test/')
				.get('/appeals/2/reps/5')
				.twice()
				.reply(200, interestedPartyCommentForReview);
		});

		describe('GET /add-document', () => {
			it('should render the add document details page', async () => {
				const response = await request.get(`${baseUrl}/2/interested-party-comments/5/add-document`);

				expect(response.statusCode).toBe(200);

				const page = parseHtml(response.text);
				expect(page.innerHTML).toMatchSnapshot();

				expect(page.querySelector('h1')?.textContent?.trim()).toBe('Upload supporting document');
				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });
				expect(unprettifiedElement.innerHTML).toContain(
					'data-document-title="interested party comment document"'
				);
			});

			it('should have the correct back link', async () => {
				const response = await request.get(`${baseUrl}/2/interested-party-comments/5/add-document`);

				expect(response.statusCode).toBe(200);

				const page = parseHtml(response.text, { rootElement: 'body' });
				expect(page.querySelector('.govuk-back-link')?.getAttribute('href')?.trim()).toBe(
					`${baseUrl}/2/interested-party-comments/5`
				);
			});

			it('should have the correct back link when editing', async () => {
				const response = await request.get(
					`${baseUrl}/2/interested-party-comments/5/add-document` +
						`?editEntrypoint=${baseUrl}/2/interested-party-comments/5/add-document`
				);

				expect(response.statusCode).toBe(200);

				const page = parseHtml(response.text, { rootElement: 'body' });
				expect(page.querySelector('.govuk-back-link')?.getAttribute('href')?.trim()).toBe(
					`${baseUrl}/2/interested-party-comments/5/add-document/check-your-answers`
				);
			});
		});

		describe('GET /add-document/redaction-status', () => {
			it('should render the redaction status page', async () => {
				const response = await request.get(
					`${baseUrl}/2/interested-party-comments/5/add-document/redaction-status`
				);
				expect(response.statusCode).toBe(200);

				const page = parseHtml(response.text);
				expect(page.innerHTML).toMatchSnapshot();

				expect(page.querySelector('h1')?.textContent?.trim()).toBe('Redaction status');
			});

			it('should have the correct back link', async () => {
				const response = await request.get(
					`${baseUrl}/2/interested-party-comments/5/add-document/redaction-status`
				);

				expect(response.statusCode).toBe(200);

				const page = parseHtml(response.text, { rootElement: 'body' });
				expect(page.querySelector('.govuk-back-link')?.getAttribute('href')?.trim()).toBe(
					`${baseUrl}/2/interested-party-comments/5/add-document`
				);
			});

			it('should have the correct back link when editing', async () => {
				const response = await request.get(
					`${baseUrl}/2/interested-party-comments/5/add-document/redaction-status` +
						`?editEntrypoint=${baseUrl}/2/interested-party-comments/5/add-document/redaction-status`
				);

				expect(response.statusCode).toBe(200);

				const page = parseHtml(response.text, { rootElement: 'body' });
				expect(page.querySelector('.govuk-back-link')?.getAttribute('href')?.trim()).toBe(
					`${baseUrl}/2/interested-party-comments/5/add-document/check-your-answers`
				);
			});
		});

		describe('GET /add-document/date-submitted', () => {
			it('should render the date submitted page', async () => {
				const response = await request.get(
					`${baseUrl}/2/interested-party-comments/5/add-document/date-submitted`
				);
				expect(response.statusCode).toBe(200);

				const page = parseHtml(response.text);
				expect(page.innerHTML).toMatchSnapshot();

				expect(page.querySelector('h1')?.textContent?.trim()).toBe(
					'When was the supporting document submitted?'
				);
			});

			it('should have the correct back link', async () => {
				const response = await request.get(
					`${baseUrl}/2/interested-party-comments/5/add-document/date-submitted`
				);

				expect(response.statusCode).toBe(200);

				const page = parseHtml(response.text, { rootElement: 'body' });
				expect(page.querySelector('.govuk-back-link')?.getAttribute('href')?.trim()).toBe(
					`${baseUrl}/2/interested-party-comments/5/add-document/redaction-status`
				);
			});

			it('should have the correct back link when editing', async () => {
				const response = await request.get(
					`${baseUrl}/2/interested-party-comments/5/add-document/date-submitted` +
						`?editEntrypoint=${baseUrl}/2/interested-party-comments/5/add-document/date-submitted`
				);

				expect(response.statusCode).toBe(200);

				const page = parseHtml(response.text, { rootElement: 'body' });
				expect(page.querySelector('.govuk-back-link')?.getAttribute('href')?.trim()).toBe(
					`${baseUrl}/2/interested-party-comments/5/add-document/check-your-answers`
				);
			});
		});
	});
});
