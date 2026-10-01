import {
	interestedPartyCommentsPublished,
	publishedAppealData
} from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';

/**
 * Pagination parameters for fetching interested party comments - note no pagination UI is implemented yet,
 * so we fetch a large number of comments to display all at once in 1 page
 * @type {{pageNumber: number, pageSize: number}}
 */
const paginationParameters = {
	pageNumber: 1,
	pageSize: 1000
};

describe('Interested Party Comments (Shared/Published View)', () => {
	beforeEach(() => {
		installMockApi();
		nock('http://test/').get('/appeals/2?include=all').reply(200, publishedAppealData);
	});

	afterEach(teardown);

	describe('GET /interested-party-comments with data', () => {
		beforeEach(() => {
			nock('http://test/')
				.get('/appeals/2/reps')
				.query({
					type: 'comment',
					status: 'published',
					pageNumber: paginationParameters.pageNumber,
					pageSize: paginationParameters.pageSize
				})
				.reply(200, interestedPartyCommentsPublished);
		});
		it('should render the shared interested party comments page with status 200', async () => {
			const response = await request.get(`${baseUrl}/2/interested-party-comments`);
			expect(response.statusCode).toEqual(200);

			const dom = parseHtml(response.text);
			//check title
			expect(dom.querySelector('h2')?.textContent?.trim()).toBe('Shared IP comments');

			//check link contents
			expect(response.text).toContain('Download all documents');
			const downloadLinkInnerHtml = parseHtml(response.text, {
				rootElement: '.govuk-body'
			}).innerHTML;
			expect(response.statusCode).toEqual(200);
			const downloadLinkUrl =
				'/documents/2/bulk-download/ip-comments/case-SHAREDTEST-ip-comments.zip';
			expect(downloadLinkInnerHtml).toContain(`href="${downloadLinkUrl}`);

			const headings = dom.querySelectorAll('h3');
			expect(headings).toHaveLength(interestedPartyCommentsPublished.itemCount);
			expect(headings[0].textContent?.trim()).toBe('Interested party 1');
			expect(headings[1].textContent?.trim()).toBe('Interested party 2');

			const summaryLists = dom.querySelectorAll('.govuk-summary-list');
			expect(summaryLists).toHaveLength(interestedPartyCommentsPublished.itemCount);

			const firstListRows = summaryLists[0].querySelectorAll('.govuk-summary-list__row');
			expect(firstListRows).toHaveLength(6);
			expect(firstListRows[0].querySelector('.govuk-summary-list__key')?.textContent?.trim()).toBe(
				'Interested party'
			);
			expect(
				firstListRows[0].querySelector('.govuk-summary-list__value')?.textContent?.trim()
			).toBe('Lee Thornton');
			expect(firstListRows[1].querySelector('.govuk-summary-list__key')?.textContent?.trim()).toBe(
				'Date received'
			);
			expect(
				firstListRows[1].querySelector('.govuk-summary-list__value')?.textContent?.trim()
			).toBe('1 April 2025, 10:15');
			expect(firstListRows[2].querySelector('.govuk-summary-list__key')?.textContent?.trim()).toBe(
				'Email'
			);
			expect(
				firstListRows[2].querySelector('.govuk-summary-list__value')?.textContent?.trim()
			).toBe('test1@example.com');
			expect(firstListRows[3].querySelector('.govuk-summary-list__key')?.textContent?.trim()).toBe(
				'Address'
			);
			expect(
				firstListRows[3].querySelector('.govuk-summary-list__value')?.textContent?.trim()
			).toBe('No address');
			expect(firstListRows[4].querySelector('.govuk-summary-list__key')?.textContent?.trim()).toBe(
				'Comment'
			);
			expect(
				firstListRows[4].querySelector('.govuk-summary-list__value')?.textContent?.trim()
			).toBe('Comment 1');
			expect(firstListRows[5].querySelector('.govuk-summary-list__key')?.textContent?.trim()).toBe(
				'Supporting documents'
			);
			expect(
				firstListRows[5].querySelector('.govuk-summary-list__value')?.textContent?.trim()
			).toBe('No documents');

			const secondListRows = summaryLists[1].querySelectorAll('.govuk-summary-list__row');
			expect(
				secondListRows[4].querySelector('.govuk-summary-list__value')?.textContent?.trim()
			).toBe('Comment 2');
			expect(dom.innerHTML).toMatchSnapshot();
		});

		it('should render a back link to case details page', async () => {
			const response = await request.get(`${baseUrl}/2/interested-party-comments`);
			const backLinkInnerHtml = parseHtml(response.text, {
				rootElement: '.govuk-back-link'
			}).innerHTML;
			expect(response.statusCode).toEqual(200);
			const backLinkUrl = '/appeals-service/appeal-details/2';
			expect(backLinkInnerHtml).toContain(`href="${backLinkUrl}`);
		});
	});
	describe('GET /interested-party-comments with site visit requested, long comment, and fallbacks', () => {
		const detailedComments = {
			itemCount: 2,
			items: [
				{
					id: 6001,
					author: 'Sarah Philips',
					status: 'published',
					originalRepresentation: 'A'.repeat(350),
					redactedRepresentation: '',
					created: '2026-03-09T13:59:00.000Z',
					siteVisitRequested: true,
					attachments: [
						{
							version: 1,
							documentVersion: {
								document: {
									caseId: 2,
									guid: 'doc-guid-1',
									name: 'document1.pdf'
								}
							}
						},
						{
							version: 1,
							documentVersion: {
								document: {
									caseId: 2,
									guid: 'doc-guid-2',
									name: 'document2.pdf'
								}
							}
						}
					],
					represented: {
						id: 4001,
						name: 'Sarah Philips',
						email: 'sarah.phillips@example.com',
						address: {
							addressLine1: '72 Guild Street',
							town: 'London',
							postCode: 'SE23 6FH'
						}
					}
				},
				{
					id: 6002,
					author: 'Jane Doe',
					status: 'published',
					originalRepresentation: 'Short comment',
					created: '2026-03-10T23:59:00.000Z',
					siteVisitRequested: false,
					attachments: [],
					represented: {
						id: 4002,
						name: 'Jane Doe',
						email: '',
						address: {}
					}
				}
			],
			page: 1,
			pageCount: 1,
			pageSize: 25
		};

		beforeEach(() => {
			nock('http://test/')
				.get('/appeals/2/reps')
				.query({
					type: 'comment',
					status: 'published',
					pageNumber: paginationParameters.pageNumber,
					pageSize: paginationParameters.pageSize
				})
				.reply(200, detailedComments);
		});

		it('should render site visit requested tag, address, documents list, and No email/No address fallbacks', async () => {
			const response = await request.get(`${baseUrl}/2/interested-party-comments`);
			expect(response.statusCode).toEqual(200);

			const dom = parseHtml(response.text);

			const tag = dom.querySelector('.govuk-tag--blue');
			expect(tag).not.toBeNull();
			expect(tag?.textContent?.trim()).toBe('Site visit requested');

			const summaryLists = dom.querySelectorAll('.govuk-summary-list');
			expect(summaryLists).toHaveLength(2);

			const list1Rows = summaryLists[0].querySelectorAll('.govuk-summary-list__row');
			expect(list1Rows[0].querySelector('.govuk-summary-list__value')?.textContent?.trim()).toBe(
				'Sarah Philips'
			);
			expect(list1Rows[1].querySelector('.govuk-summary-list__value')?.textContent?.trim()).toBe(
				'9 March 2026, 13:59'
			);
			expect(list1Rows[2].querySelector('.govuk-summary-list__value')?.textContent?.trim()).toBe(
				'sarah.phillips@example.com'
			);
			expect(list1Rows[3].querySelector('.govuk-summary-list__value')?.textContent?.trim()).toBe(
				'72 Guild Street, London, SE23 6FH'
			);
			expect(list1Rows[4].querySelector('.pins-show-more')).not.toBeNull();
			expect(list1Rows[4].querySelector('.pins-show-more')?.getAttribute('data-label')).toBe(
				'Read more'
			);
			const docLinks = list1Rows[5].querySelectorAll('a');
			expect(docLinks).toHaveLength(2);
			expect(docLinks[0].textContent?.trim()).toBe('document1.pdf');
			expect(docLinks[1].textContent?.trim()).toBe('document2.pdf');

			const list2Rows = summaryLists[1].querySelectorAll('.govuk-summary-list__row');
			expect(list2Rows[2].querySelector('.govuk-summary-list__value')?.textContent?.trim()).toBe(
				'No email'
			);
			expect(list2Rows[3].querySelector('.govuk-summary-list__value')?.textContent?.trim()).toBe(
				'No address'
			);
			expect(list2Rows[5].querySelector('.govuk-summary-list__value')?.textContent?.trim()).toBe(
				'No documents'
			);
		});
	});
	describe('GET /interested-party-comments when item count is 0', () => {
		beforeEach(() => {
			nock('http://test/')
				.get('/appeals/2/reps')
				.query({
					type: 'comment',
					status: 'published',
					pageNumber: paginationParameters.pageNumber,
					pageSize: paginationParameters.pageSize
				})
				.reply(200, {
					itemCount: 0,
					items: [],
					page: 1,
					pageCount: 0,
					pageSize: paginationParameters.pageSize
				});
			nock('http://test/').get('/appeals/2?include=all').reply(200, publishedAppealData);
		});

		it('should render the shared interested party comments page with status 200', async () => {
			const response = await request.get(`${baseUrl}/2/interested-party-comments`);
			expect(response.statusCode).toEqual(200);

			const dom = parseHtml(response.text);
			//check title
			expect(dom.querySelector('h2')?.textContent?.trim()).toBe('Shared IP comments');

			//check link contents
			expect(response.text).toContain('Download all documents');
			const downloadLinkInnerHtml = parseHtml(response.text, {
				rootElement: '.govuk-body'
			}).innerHTML;
			const downloadLinkUrl =
				'/documents/2/bulk-download/ip-comments/case-SHAREDTEST-ip-comments.zip';
			expect(downloadLinkInnerHtml).toContain(`href="${downloadLinkUrl}`);

			const summaryLists = dom.querySelectorAll('.govuk-summary-list');
			expect(summaryLists).toHaveLength(0);
			expect(dom.innerHTML).toMatchSnapshot();
		});

		it('should render the shared interested party comments page when statements completed and 0 published comments (e.g. only rejected)', async () => {
			nock.cleanAll();
			nock('http://test/')
				.get('/appeals/2?include=all')
				.reply(200, {
					...publishedAppealData,
					appealStatus: APPEAL_CASE_STATUS.FINAL_COMMENTS,
					documentationSummary: {
						ipComments: {
							status: 'received',
							counts: {
								published: 0,
								awaiting_review: 0,
								valid: 0,
								invalid: 1
							}
						}
					}
				});
			nock('http://test/')
				.get('/appeals/2/reps')
				.query({
					type: 'comment',
					status: 'published',
					pageNumber: paginationParameters.pageNumber,
					pageSize: paginationParameters.pageSize
				})
				.reply(200, {
					itemCount: 0,
					items: [],
					page: 1,
					pageCount: 0,
					pageSize: paginationParameters.pageSize
				});

			const response = await request.get(`${baseUrl}/2/interested-party-comments`);
			expect(response.statusCode).toEqual(200);

			const page = parseHtml(response.text);
			expect(page.querySelector('h2')?.textContent?.trim()).toBe('Shared IP comments');
			expect(page.querySelector('.govuk-tabs')).toBeNull();
		});
	});
});
describe.each([
	APPEAL_CASE_STATUS.COMPLETE,
	APPEAL_CASE_STATUS.CLOSED,
	APPEAL_CASE_STATUS.WITHDRAWN,
	APPEAL_CASE_STATUS.INVALID
])(
	'GET /interested-party-comments without add IP comment link when appeal status is %s',
	(appealStatus) => {
		beforeEach(() => {
			nock('http://test/')
				.get('/appeals/2?include=all')
				.reply(200, { ...publishedAppealData, appealStatus });
			nock('http://test/')
				.get('/appeals/2/reps')
				.query({
					type: 'comment',
					status: 'published',
					pageNumber: paginationParameters.pageNumber,
					pageSize: paginationParameters.pageSize
				})
				.reply(200, interestedPartyCommentsPublished);
		});

		it('should render the shared interested party comments page with status 200 and no "Add IP comment" link', async () => {
			const response = await request.get(`${baseUrl}/2/interested-party-comments`);
			expect(response.statusCode).toEqual(200);

			const dom = parseHtml(response.text);
			expect(dom.querySelector('h2')?.textContent?.trim()).toBe('Shared IP comments');

			expect(response.text).toContain('Download all documents');
			const downloadLinkInnerHtml = parseHtml(response.text, {
				rootElement: '.govuk-body'
			}).innerHTML;
			const downloadLinkUrl =
				'/documents/2/bulk-download/ip-comments/case-SHAREDTEST-ip-comments.zip';
			expect(downloadLinkInnerHtml).toContain(`href="${downloadLinkUrl}`);

			expect(response.text).not.toContain('Add interested party comment');

			const summaryLists = dom.querySelectorAll('.govuk-summary-list');
			expect(summaryLists).toHaveLength(interestedPartyCommentsPublished.itemCount);

			const headings = dom.querySelectorAll('h3');
			expect(headings).toHaveLength(interestedPartyCommentsPublished.itemCount);
			expect(headings[0].textContent?.trim()).toBe('Interested party 1');
			expect(headings[1].textContent?.trim()).toBe('Interested party 2');

			expect(dom.innerHTML).toMatchSnapshot();
		});
	}
);
