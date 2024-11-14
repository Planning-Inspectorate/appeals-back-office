import {
	appealDataFullPlanning,
	interestedPartyCommentForReview,
	representationRejectionReasons
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
			.get('/appeals/2')
			.reply(200, {
				...appealDataFullPlanning,
				appealId: 2,
				appealStatus: 'statements'
			});
	});

	afterEach(teardown);

	describe('GET /review-comment with data', () => {
		beforeEach(() => {
			nock('http://test/').get('/appeals/2/reps/5').reply(200, interestedPartyCommentForReview);
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
			nock('http://test/').get('/appeals/2/reps/5').reply(200, interestedPartyCommentForReview);
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
			nock('http://test/').patch('/appeals/2/reps/5/status').reply(200, {});
		});

		it('should set represnetation status to valid', async () => {
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
				.get('/appeals/representation-rejection-reasons')
				.reply(200, representationRejectionReasons);
		});
		afterEach(teardown);
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
	});

	describe('GET /reject/allow-resubmit', () => {
		beforeEach(() => {
			nock('http://test/').get('/appeals/2/reps/5').reply(200, interestedPartyCommentForReview);
			nock('http://test/')
				.post('/appeals/add-business-days')
				.reply(200, JSON.stringify('2024-11-13T00:00:00.000Z'));
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
	});

	describe('GET /reject/check-your-answers', () => {
		beforeEach(() => {
			nock('http://test/').get('/appeals/2/reps/5').reply(200, interestedPartyCommentForReview);
			nock('http://test')
				.get('/appeals/representation-rejection-reasons')
				.reply(200, representationRejectionReasons);
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
		});
	});
});
