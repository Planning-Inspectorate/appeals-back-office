import { parseHtml } from '@pins/platform';
import supertest from 'supertest';
import {
	appealDataFullPlanning,
	interestedPartyCommentsAwaitingReview,
	interestedPartyCommentsValid,
	interestedPartyCommentsInvalid,
	interestedPartyCommentForReview
} from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import nock from 'nock';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';

describe('interested-party-comments', () => {
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
	});

	afterEach(teardown);

	describe('GET /interested-party-comments with data', () => {
		beforeEach(() => {
			nock('http://test/')
				.get('/appeals/2/reps/comments')
				.query({ pageNumber: '1', pageSize: '1000', status: 'awaiting_review' })
				.reply(200, interestedPartyCommentsAwaitingReview);
			nock('http://test/')
				.get('/appeals/2/reps/comments')
				.query({ pageNumber: '1', pageSize: '1000', status: 'valid' })
				.reply(200, interestedPartyCommentsValid);
			nock('http://test/')
				.get('/appeals/2/reps/comments')
				.query({ pageNumber: '1', pageSize: '1000', status: 'invalid' })
				.reply(200, interestedPartyCommentsInvalid);
		});
		it('should render interestedPartyComments page with awaiting review comments', async () => {
			const response = await request.get(`${baseUrl}/2/interested-party-comments`);

			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('Interested Party Comments</h1>');
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
			expect(elementInnerHtml).toContain('Interested Party Comments</h1>');

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

		it('should render interestedPartyComments page with invalid comments', async () => {
			const response = await request.get(`${baseUrl}/2/interested-party-comments`);
			const dom = parseHtml(response.text);

			// Check if there's a tab with #invalid href
			const invalidTab = dom.querySelector('[href="#invalid"]');
			expect(invalidTab).not.toBeNull();

			const elementInnerHtml = dom.innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('Interested Party Comments</h1>');

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
				.get('/appeals/2/reps/comments')
				.query({ pageNumber: '1', pageSize: '1000', status: 'awaiting_review' })
				.reply(200, {});
			nock('http://test/')
				.get('/appeals/2/reps/comments')
				.query({ pageNumber: '1', pageSize: '1000', status: 'valid' })
				.reply(200, {});
			nock('http://test/')
				.get('/appeals/2/reps/comments')
				.query({ pageNumber: '1', pageSize: '1000', status: 'invalid' })
				.reply(200, {});
		});
		it('should render interestedPartyComments page with "Awaiting comments" message when no awaiting review data', async () => {
			const response = await request.get(`${baseUrl}/2/interested-party-comments`);

			expect(response.statusCode).toBe(200);

			const dom = parseHtml(response.text);
			const awaitingReviewTable = dom.querySelector('#awaiting-review');
			expect(awaitingReviewTable).not.toBeNull();

			console.log(awaitingReviewTable?.innerHTML);

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

	describe('GET /review-comment with data', () => {
		beforeEach(() => {
			nock('http://test/').get('/appeals/2/reps/5').reply(200, interestedPartyCommentForReview);
		});

		it('should render review comment page with the provided comment details', async () => {
			const response = await request.get(`${baseUrl}/2/interested-party-comments/5/review`);

			expect(response.statusCode).toBe(200);

			const elementInnerHtml = parseHtml(response.text).innerHTML;
			expect(elementInnerHtml).toMatchSnapshot();
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
});
