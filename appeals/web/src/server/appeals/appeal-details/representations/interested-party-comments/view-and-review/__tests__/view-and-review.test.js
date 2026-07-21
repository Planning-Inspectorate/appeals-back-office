import usersService from '#appeals/appeal-users/users-service.js';
import { dateISOStringToDisplayDate } from '#lib/dates.js';
import {
	activeDirectoryUsersData,
	appealDataFullPlanning,
	costsFolderInfoAppellantApplication,
	documentFileInfo,
	documentFileVersionsInfo,
	documentFolderInfo,
	documentRedactionStatuses,
	fileUploadInfo,
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

/**
 * @param {number} appealId
 * @param {number} folderId
 * @param {number} [repId]
 * @returns {string}
 */
const getFolderApiUrl = (appealId, folderId, repId) => {
	const repString = repId ? `&repId=${repId}` : '';
	return `/appeals/${appealId}/document-folders/${folderId}?pageNumber=1&pageSize=100${repString}`;
};

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
			.reply(200, [{ folderId: 1234, path: 'representation/representationAttachments' }])
			.persist();

		nock('http://test/')
			.get(getFolderApiUrl(2, 1, 3670))
			.reply(200, costsFolderInfoAppellantApplication)
			.persist();

		nock('http://test/')
			.get('/appeals/document-redaction-statuses')
			.reply(200, documentRedactionStatuses)
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
				.get(getFolderApiUrl(2, 1))
				.reply(200, costsFolderInfoAppellantApplication)
				.persist();

			nock('http://test/')
				.get('/appeals/2/reps?type=comment')
				.reply(200, interestedPartyCommentsForReview);

			nock('http://test/').get('/appeals/documents/1').reply(200, documentFileInfo);
		});

		it('should render a 404 error page if the folderId is invalid', async () => {
			nock('http://test/').get(getFolderApiUrl(2, 99)).reply(404);

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
				.get(getFolderApiUrl(2, 1))
				.reply(200, costsFolderInfoAppellantApplication)
				.persist();

			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses);

			nock('http://test/').get(getFolderApiUrl(2, 1)).reply(200, documentFolderInfo).persist();

			nock('http://test/')
				.get('/appeals/2/reps?type=comment')
				.reply(200, interestedPartyCommentsForReview);

			nock('http://test/').get('/appeals/documents/1').reply(200, documentFileInfo);
		});

		it('should render a 404 error page if the folderId is invalid', async () => {
			nock('http://test/').get(getFolderApiUrl(2, 99)).reply(404);

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
				.get(getFolderApiUrl(2, 1))
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
				.get(getFolderApiUrl(2, 1))
				.reply(200, costsFolderInfoAppellantApplication)
				.persist();

			nock('http://test/')
				.get('/appeals/document-redaction-statuses')
				.reply(200, documentRedactionStatuses);

			nock('http://test/').get(getFolderApiUrl(2, 1)).reply(200, documentFolderInfo).persist();

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

				expect(page.querySelector('h1')?.textContent?.trim()).toBe('Upload supporting documents');
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
	});

	describe('POST /add-document', () => {
		beforeEach(() => {
			nock('http://test/').get('/appeals/2/reps/5').reply(200, interestedPartyCommentForReview);
		});
		it(`should render a 500 error page if upload-info is not present in the request body`, async () => {
			const response = await request
				.post(`${baseUrl}/2/interested-party-comments/5/add-document`)
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
				.post(`${baseUrl}/2/interested-party-comments/5/add-document`)
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

		it('should redirect to the add document details page if upload info is present and in the correct format', async () => {
			const response = await request
				.post(`${baseUrl}/2/interested-party-comments/5/add-document`)
				.send({
					'upload-info': fileUploadInfo
				});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				`Found. Redirecting to ${baseUrl}/2/interested-party-comments/5/add-document/add-document-details`
			);
		});
	});

	describe('GET /add-document/add-document-details', () => {
		beforeEach(() => {
			nock('http://test/')
				.get('/appeals/2/reps/5')
				.reply(200, interestedPartyCommentForReview)
				.persist();

			nock('http://test/')
				.get('/appeals/2?include=all')
				.reply(200, {
					...appealDataFullPlanning,
					appealId: 2,
					appealStatus: 'statements'
				});
		});

		it(`should render a 500 error page if fileUploadInfo is not present in the session`, async () => {
			const response = await request.get(
				`${baseUrl}/2/interested-party-comments/5/add-document/add-document-details`
			);

			expect(response.statusCode).toBe(500);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Sorry, there is a problem with the service</h1>'
			);
		});

		it('should render the add documents details page', async () => {
			await request.post(`${baseUrl}/2/interested-party-comments/5/add-document`).send({
				'upload-info': fileUploadInfo
			});

			const response = await request.get(
				`${baseUrl}/2/interested-party-comments/5/add-document/add-document-details`
			);
			expect(response.statusCode).toBe(200);
			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });
			expect(unprettifiedElement.innerHTML).toContain('Add document details</span');
			expect(unprettifiedElement.innerHTML).toContain(`Representation attachment documents</h1>`);
		});
	});

	describe('POST /add-document/add-document-details', () => {
		beforeEach(async () => {
			nock('http://test/')
				.get('/appeals/2/reps/5')
				.reply(200, interestedPartyCommentForReview)
				.persist();

			nock('http://test/')
				.get('/appeals/2?include=all')
				.reply(200, {
					...appealDataFullPlanning,
					appealId: 2,
					appealStatus: 'statements'
				})
				.persist();

			await request.post(`${baseUrl}/2/interested-party-comments/5/add-document`).send({
				'upload-info': fileUploadInfo
			});
		});

		it(`should re-render add documents details page if the request body is in an incorrect format`, async () => {
			const response = await request
				.post(`${baseUrl}/2/interested-party-comments/5/add-document/add-document-details`)
				.send({});

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
			expect(unprettifiedElement.innerHTML).toContain(`Representation attachment documents</h1>`);

			const errorSummaryElement = parseHtml(response.text, {
				rootElement: '.govuk-error-summary'
			});

			expect(errorSummaryElement.innerHTML).toContain('There is a problem with the service');
		});

		it(`should re-render the document details page with the expected error message if receivedDate day is an invalid value`, async () => {
			const testCases = [
				{
					value: '',
					expectedError: `Supporting document date must include a day`
				},
				{
					value: 'a',
					expectedError: `Supporting document date day must be a number`
				},
				{
					value: '0',
					expectedError: `Supporting document date day must be between 1 and 31`
				},
				{
					value: '32',
					expectedError: `Supporting document date day must be between 1 and 31`
				}
			];

			for (const testCase of testCases) {
				const response = await request
					.post(`${baseUrl}/2/interested-party-comments/5/add-document/add-document-details`)
					.send({
						items: [
							{
								documentId: '4541e025-00e1-4458-aac6-d1b51f6ae0a7',
								receivedDate: {
									day: testCase.value,
									month: '2',
									year: '2030'
								},
								redactionStatus: 3
							}
						]
					});

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
				expect(unprettifiedElement.innerHTML).toContain(`Representation attachment documents</h1>`);

				const errorSummaryElement = parseHtml(response.text, {
					rootElement: '.govuk-error-summary'
				});

				expect(errorSummaryElement.innerHTML).toContain(testCase.expectedError);
			}
		});

		it(`should re-render the document details page with the expected error message if receivedDate month is an invalid value`, async () => {
			const testCases = [
				{
					value: '',
					expectedError: `Supporting document date must include a month`
				},
				{
					value: 'a',
					expectedError: `Supporting document date must be a real date`
				},
				{
					value: '0',
					expectedError: `Supporting document date month must be between 1 and 12`
				},
				{
					value: '13',
					expectedError: `Supporting document date month must be between 1 and 12`
				}
			];

			for (const testCase of testCases) {
				const response = await request
					.post(`${baseUrl}/2/interested-party-comments/5/add-document/add-document-details`)
					.send({
						items: [
							{
								documentId: '4541e025-00e1-4458-aac6-d1b51f6ae0a7',
								receivedDate: {
									day: '1',
									month: testCase.value,
									year: '2030'
								},
								redactionStatus: 3
							}
						]
					});

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
				expect(unprettifiedElement.innerHTML).toContain(`Representation attachment documents</h1>`);

				const errorSummaryElement = parseHtml(response.text, {
					rootElement: '.govuk-error-summary'
				});

				expect(errorSummaryElement.innerHTML).toContain(testCase.expectedError);
			}
		});

		it(`should re-render the document details page with the expected error message if receivedDate year is an invalid value`, async () => {
			const testCases = [
				{
					value: '',
					expectedError: `Supporting document date must include a year`
				},
				{
					value: 'a',
					expectedError: `Supporting document date year must be a number`
				},
				{
					value: '202',
					expectedError: `Supporting document date year must be 4 digits`
				}
			];

			for (const testCase of testCases) {
				const response = await request
					.post(`${baseUrl}/2/interested-party-comments/5/add-document/add-document-details`)
					.send({
						items: [
							{
								documentId: '4541e025-00e1-4458-aac6-d1b51f6ae0a7',
								receivedDate: {
									day: '1',
									month: '2',
									year: testCase.value
								},
								redactionStatus: 3
							}
						]
					});

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
				expect(unprettifiedElement.innerHTML).toContain(`Representation attachment documents</h1>`);

				const errorSummaryElement = parseHtml(response.text, {
					rootElement: '.govuk-error-summary'
				});

				expect(errorSummaryElement.innerHTML).toContain(testCase.expectedError);
			}
		});

		it(`should re-render add documents details page if receivedDate is not a valid date`, async () => {
			const testCases = [
				{
					value: {
						day: '29',
						month: '2',
						year: 2023
					},
					expectedError: `Supporting document date must be a real date`
				},
				{
					value: {
						day: '',
						month: '',
						year: ''
					},
					expectedError: `Enter the date you received the supporting document`
				},
				{
					value: {
						day: '2',
						month: '',
						year: ''
					},
					expectedError: `Supporting document date must include a month and year`
				},
				{
					value: {
						day: '',
						month: '2',
						year: ''
					},
					expectedError: `Supporting document date must include a day and year`
				},
				{
					value: {
						day: '',
						month: '',
						year: '2025'
					},
					expectedError: `Supporting document date must include a day and month`
				}
			];

			for (const testCase of testCases) {
				const response = await request
					.post(`${baseUrl}/2/interested-party-comments/5/add-document/add-document-details`)
					.send({
						items: [
							{
								documentId: '4541e025-00e1-4458-aac6-d1b51f6ae0a7',
								receivedDate: testCase.value,
								redactionStatus: 3
							}
						]
					});

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Add document details</span><h1');
				expect(unprettifiedElement.innerHTML).toContain(`Representation attachment documents</h1>`);

				const errorSummaryElement = parseHtml(response.text, {
					rootElement: '.govuk-error-summary'
				});

				expect(errorSummaryElement.innerHTML).toContain(testCase.expectedError);
			}
		});

		it(`should redirect to check your answers if valid details posted`, async () => {
			const response = await request
				.post(`${baseUrl}/2/interested-party-comments/5/add-document/add-document-details`)
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

			expect(response.text).toBe(
				`Found. Redirecting to ${baseUrl}/2/interested-party-comments/5/add-document/check-your-answers`
			);
		});
	});

	describe('GET /add-document/check-your-answers', () => {
		beforeEach(() => {
			nock('http://test/')
				.get('/appeals/2/reps/5')
				.reply(200, interestedPartyCommentForReview)
				.persist();

			nock('http://test/')
				.get('/appeals/2?include=all')
				.reply(200, {
					...appealDataFullPlanning,
					appealId: 2,
					appealStatus: 'statements'
				})
				.persist();

			nock('http://test/')
				.get('/appeals/2/document-folders?path=representation/representationAttachments')
				.reply(200, [{ folderId: 1234, path: 'representation/attachments' }])
				.persist();
		});

		it(`should render check your answers page with correct content`, async () => {
			const response1 = await request
				.post(`${baseUrl}/2/interested-party-comments/5/add-document`)
				.send({
					'upload-info': fileUploadInfo
				});
			expect(response1.statusCode).toBe(302);

			const response2 = await request
				.post(`${baseUrl}/2/interested-party-comments/5/add-document/add-document-details`)
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
			expect(response2.statusCode).toBe(302);

			const response = await request.get(
				`${baseUrl}/2/interested-party-comments/5/add-document/check-your-answers`
			);

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Appeal 351062</span');
			expect(unprettifiedElement.innerHTML).toContain(`Check your answers</h1>`);
			expect(unprettifiedElement.innerHTML).toContain('File</dt>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<a class="govuk-link" href="/documents/APP/Q9999/D/21/351062/download-uncommitted/1/test-document.txt" target="_blank">test-document.txt</a></dd>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				`<a class="govuk-link" href="/appeals-service/appeal-details/2/interested-party-comments/5/add-document">Change<span class="govuk-visually-hidden"> file test-document.txt</span></a></dd>`
			);
			expect(unprettifiedElement.innerHTML).toContain('Date received</dt>');
			expect(unprettifiedElement.innerHTML).toContain(
				`${dateISOStringToDisplayDate(new Date().toISOString())}</dd>`
			);
			expect(unprettifiedElement.innerHTML).toContain('Redaction status</dt>');
			expect(unprettifiedElement.innerHTML).toContain('No redaction required</dd>');
			expect(unprettifiedElement.innerHTML).toContain(
				`<a class="govuk-link" href="/appeals-service/appeal-details/2/interested-party-comments/5/add-document/add-document-details">Change<span class="govuk-visually-hidden"> test-document.txt date received</span></a></dd>`
			);
			expect(unprettifiedElement.innerHTML).toContain('Confirm</button>');
		});
	});

	describe('POST /add-document/check-your-answers', () => {
		beforeEach(() => {
			nock('http://test/')
				.get('/appeals/2/reps/5')
				.reply(200, interestedPartyCommentForReview)
				.persist();

			nock('http://test/')
				.get('/appeals/2?include=all')
				.reply(200, {
					...appealDataFullPlanning,
					appealId: 2,
					appealStatus: 'statements'
				})
				.persist();

			nock('http://test/')
				.get('/appeals/2/document-folders?path=representation/representationAttachments')
				.reply(200, [{ folderId: 1234, path: 'representation/attachments' }])
				.persist();

			nock('http://test/').post('/appeals/2/documents').reply(200, {}).persist();

			nock('http://test/').patch('/appeals/2/reps/3670/attachments').reply(200, {}).persist();
		});

		it(`should redirect to relevant interested party comment review page`, async () => {
			await request.post(`${baseUrl}/2/interested-party-comments/5/add-document`).send({
				'upload-info': fileUploadInfo
			});

			await request
				.post(`${baseUrl}/2/interested-party-comments/5/add-document/add-document-details`)
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

			const response = await request
				.post(`${baseUrl}/2/interested-party-comments/5/add-document/check-your-answers`)
				.send({});

			expect(response.statusCode).toBe(302);

			expect(response.text).toBe(
				`Found. Redirecting to ${baseUrl}/2/interested-party-comments/5/review`
			);
		});
	});
});
