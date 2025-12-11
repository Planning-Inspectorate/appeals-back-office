import {
	appealDataFullPlanning,
	interestedPartyCommentsAwaitingReview,
	interestedPartyCommentsInvalid,
	interestedPartyCommentsValid
} from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
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
	});

	afterEach(teardown);

	describe('GET /interested-party-comments with data', () => {
		beforeEach(() => {
			nock('http://test/')
				.get('/appeals/2/reps')
				.query({ pageNumber: '1', pageSize: '1000', status: 'awaiting_review', type: 'comment' })
				.reply(200, interestedPartyCommentsAwaitingReview);
			nock('http://test/')
				.get('/appeals/2/reps')
				.query({ pageNumber: '1', pageSize: '1000', status: 'valid', type: 'comment' })
				.reply(200, interestedPartyCommentsValid);
			nock('http://test/')
				.get('/appeals/2/reps')
				.query({ pageNumber: '1', pageSize: '1000', status: 'invalid', type: 'comment' })
				.reply(200, interestedPartyCommentsInvalid);
		});
		it('should render interestedPartyComments page with awaiting review comments', async () => {
			const response = await request.get(`${baseUrl}/2/interested-party-comments`);

			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('Interested party comments</h1>');
			const selectedTab = parseHtml(response.text, {
				rootElement: '.govuk-tabs__list-item--selected',
				skipPrettyPrint: true
			}).innerHTML;
			expect(selectedTab).toContain('Awaiting review');

			// Check the first row of the awaiting review comments table
			const firstRow = parseHtml(response.text).querySelector(
				'.govuk-table__body .govuk-table__row'
			);
			expect(firstRow).not.toBeNull();
			const columns = firstRow?.querySelectorAll('.govuk-table__cell');
			expect(columns?.[0].textContent?.trim()).toBe('Eva Sharma');
			expect(columns?.[1].textContent?.trim()).toBe('24 September 2024');
			expect(columns?.[2].textContent?.trim()).toBe(
				'Review interested party comments from Eva Sharma'
			);
		});

		it('should render interestedPartyComments page with valid comments', async () => {
			const response = await request.get(`${baseUrl}/2/interested-party-comments`);
			const dom = parseHtml(response.text);

			// Check if there's a tab with #valid href
			const validTab = dom.querySelector('[href="#valid"]');
			expect(validTab).not.toBeNull();

			const elementInnerHtml = dom.innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('Interested party comments</h1>');

			// Check the first row of the valid comments table
			const validTable = dom.querySelector('#valid .govuk-table__body');
			expect(validTable).not.toBeNull();
			const firstRow = validTable?.querySelector('.govuk-table__row');
			expect(firstRow).not.toBeNull();
			const columns = firstRow?.querySelectorAll('.govuk-table__cell');
			expect(columns?.[0].textContent?.trim()).toBe('Roger Simmons');
			expect(columns?.[1].textContent?.trim()).toBe('24 September 2024');
			expect(columns?.[2].textContent?.trim()).toBe(
				'View interested party comments from Roger Simmons'
			);
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

		it('should render a back link to the originally specified backUrl', async () => {
			nock('http://test/')
				.get('/appeals/2?include=all')
				.twice()
				.reply(200, {
					...appealDataFullPlanning,
					appealId: 2,
					appealStatus: 'statements'
				});
			nock('http://test/')
				.get('/appeals/2/reps')
				.query({ pageNumber: '1', pageSize: '1000', status: 'awaiting_review', type: 'comment' })
				.reply(200, interestedPartyCommentsAwaitingReview);
			nock('http://test/')
				.get('/appeals/2/reps')
				.query({ pageNumber: '1', pageSize: '1000', status: 'valid', type: 'comment' })
				.reply(200, interestedPartyCommentsValid);
			nock('http://test/')
				.get('/appeals/2/reps')
				.query({ pageNumber: '1', pageSize: '1000', status: 'invalid', type: 'comment' })
				.reply(200, interestedPartyCommentsInvalid);

			// set back URL
			await request.get(`${baseUrl}/2/interested-party-comments?backUrl=/test/back/url`);
			// visit other page(s)
			await request.get(`${baseUrl}/2/interested-party-comments/add/ip-details`);
			// visit the original page
			const response = await request.get(`${baseUrl}/2/interested-party-comments`);

			const backLinkInnerHtml = parseHtml(response.text, {
				rootElement: '.govuk-back-link'
			}).innerHTML;

			expect(response.statusCode).toEqual(200);

			const backLinkUrl = '/test/back/url';

			expect(backLinkInnerHtml).toContain(`href="${backLinkUrl}`);
		});

		it('should render interestedPartyComments page with invalid comments', async () => {
			const response = await request.get(`${baseUrl}/2/interested-party-comments`);
			const dom = parseHtml(response.text);

			// Check if there's a tab with #invalid href
			const invalidTab = dom.querySelector('[href="#invalid"]');
			expect(invalidTab).not.toBeNull();

			const elementInnerHtml = dom.innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('Interested party comments</h1>');

			// Check the first row of the invalid comments table
			const invalidTable = dom.querySelector('#invalid .govuk-table__body');
			expect(invalidTable).not.toBeNull();
			const firstRow = invalidTable?.querySelector('.govuk-table__row');
			expect(firstRow).not.toBeNull();
			const columns = firstRow?.querySelectorAll('.govuk-table__cell');
			expect(columns?.[0].textContent?.trim()).toBe('Ryan Marshall');
			expect(columns?.[1].textContent?.trim()).toBe('24 September 2024');
			expect(columns?.[2].textContent?.trim()).toBe(
				'View interested party comments from Ryan Marshall'
			);
		});
	});

	describe('GET /interested-party-comments with no data', () => {
		beforeEach(() => {
			nock('http://test/')
				.get('/appeals/2/reps')
				.query({ pageNumber: '1', pageSize: '1000', status: 'awaiting_review', type: 'comment' })
				.reply(200, {});
			nock('http://test/')
				.get('/appeals/2/reps')
				.query({ pageNumber: '1', pageSize: '1000', status: 'valid', type: 'comment' })
				.reply(200, {});
			nock('http://test/')
				.get('/appeals/2/reps')
				.query({ pageNumber: '1', pageSize: '1000', status: 'invalid', type: 'comment' })
				.reply(200, {});
		});
		it('should render interestedPartyComments page with "Awaiting comments" message when no awaiting review data', async () => {
			const response = await request.get(`${baseUrl}/2/interested-party-comments`);

			expect(response.statusCode).toBe(200);

			const dom = parseHtml(response.text);
			const awaitingReviewTable = dom.querySelector('#awaiting-review');
			expect(awaitingReviewTable).not.toBeNull();

			const awaitingMessage = awaitingReviewTable?.querySelector('p');
			expect(awaitingMessage).not.toBeNull();
			expect(awaitingMessage?.textContent?.trim()).toBe('Awaiting comments');
		});

		it('should render interestedPartyComments page with "No valid comments" message when no valid data', async () => {
			const response = await request.get(`${baseUrl}/2/interested-party-comments`);

			expect(response.statusCode).toBe(200);

			const dom = parseHtml(response.text);
			const validTable = dom.querySelector('#valid');
			expect(validTable).not.toBeNull();

			const validMessage = validTable?.querySelector('p');
			expect(validMessage).not.toBeNull();
			expect(validMessage?.textContent?.trim()).toBe('No valid comments');
		});

		it('should render interestedPartyComments page with "No invalid comments" message when no invalid data', async () => {
			const response = await request.get(`${baseUrl}/2/interested-party-comments`);

			expect(response.statusCode).toBe(200);

			const dom = parseHtml(response.text);
			const invalidTable = dom.querySelector('#invalid');
			expect(invalidTable).not.toBeNull();

			const invalidMessage = invalidTable?.querySelector('p');
			expect(invalidMessage).not.toBeNull();
			expect(invalidMessage?.textContent?.trim()).toBe('No invalid comments');
		});
	});

	describe('GET /interested-party-comments/add/ip-details', () => {
		const appealId = 2;

		it('should render the "Interested party details" page with the expected content and back link URL', async () => {
			const response = await request.get(
				`${baseUrl}/${appealId}/interested-party-comments/add/ip-details?backUrl=/test/back/url`
			);

			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('Interested party details</h1>');

			const backLinkHtml = parseHtml(response.text, { rootElement: '.govuk-back-link' }).innerHTML;

			expect(backLinkHtml).toContain('href="/test/back/url"');
		});

		it('should show the backUrl for the previous page if backUrl was more recently set on the main landing page', async () => {
			nock('http://test/')
				.get('/appeals/2?include=all')
				.twice()
				.reply(200, {
					...appealDataFullPlanning,
					appealId: 2,
					appealStatus: 'statements'
				});

			await request.get(
				`${baseUrl}/${appealId}/interested-party-comments/add/ip-details?backUrl=/test/back/url1`
			);
			await request.get(`${baseUrl}/${appealId}/interested-party-comments?backUrl=/test/back/url2`);
			const response = await request.get(
				`${baseUrl}/${appealId}/interested-party-comments/add/ip-details`
			);

			const backLinkHtml = parseHtml(response.text, { rootElement: '.govuk-back-link' });

			expect(backLinkHtml.querySelector('a')?.getAttribute('href')).toBe(
				'/appeals-service/appeal-details/2/interested-party-comments'
			);
		});
	});
});
