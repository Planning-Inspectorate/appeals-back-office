import { paginationDefaultSettings } from '#appeals/appeal.constants';
import {
	interestedPartyCommentsPublished,
	publishedAppealData
} from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';

describe('Interested Party Comments (Shared/Published View)', () => {
	beforeEach(() => {
		installMockApi();
		nock('http://test/').get('/appeals/2').reply(200, publishedAppealData);
	});

	afterEach(teardown);

	describe('GET /interested-party-comments with data', () => {
		beforeEach(() => {
			nock('http://test/')
				.get('/appeals/2/reps')
				.query({
					type: 'comment',
					status: 'published',
					pageNumber: paginationDefaultSettings.firstPageNumber,
					pageSize: paginationDefaultSettings.pageSize
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
			const downloadLinkUrl = '/documents/2/bulk-download/documents';
			expect(downloadLinkInnerHtml).toContain(`href="${downloadLinkUrl}`);

			//check number of table rows
			const tableRows = dom.querySelectorAll('.govuk-table__body tr');
			expect(tableRows).toHaveLength(interestedPartyCommentsPublished.itemCount);

			//check content of table rows
			const firstRow = parseHtml(response.text).querySelector(
				'.govuk-table__body .govuk-table__row'
			);
			const row1columns = firstRow?.querySelectorAll('.govuk-table__cell');
			expect(firstRow).not.toBeNull();
			expect(row1columns?.[1].textContent?.trim()).toBe('Comment 1');
			const nextRow = firstRow?.nextElementSibling;
			expect(nextRow).not.toBeNull();
			const row2columns = nextRow?.querySelectorAll('.govuk-table__cell');
			expect(row2columns?.[1].textContent?.trim()).toBe('Comment 2');
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

	describe('GET /interested-party-comments when item count is 0', () => {
		beforeEach(() => {
			nock('http://test/')
				.get('/appeals/2/reps')
				.query({
					type: 'comment',
					status: 'published',
					pageNumber: paginationDefaultSettings.firstPageNumber,
					pageSize: paginationDefaultSettings.pageSize
				})
				.reply(200, {
					itemCount: 0,
					items: [],
					page: 1,
					pageCount: 0,
					pageSize: paginationDefaultSettings.pageSize
				});
			nock('http://test/').get('/appeals/2').reply(200, publishedAppealData);
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
			const downloadLinkUrl = `/documents/2/bulk-download/documents`;
			expect(downloadLinkInnerHtml).toContain(`href="${downloadLinkUrl}`);

			//check number of table rows
			const tableRows = dom.querySelectorAll('.govuk-table__body tr');
			expect(tableRows).toHaveLength(0);

			//check content of table rows
			const firstRow = parseHtml(response.text).querySelector(
				'.govuk-table__body .govuk-table__row'
			);
			expect(firstRow).toBeNull();
			expect(dom.innerHTML).toMatchSnapshot();
		});
	});
});
