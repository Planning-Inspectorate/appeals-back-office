import {
	appealDataFullPlanning,
	finalCommentsForReview
} from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';

describe('final-comments', () => {
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
			.get('/appeals/2/document-folders?path=representation/representationAttachments')
			.reply(200, [{ folderId: 1234 }]);

		nock('http://test/')
			.get('/appeals/2/reps?type=lpa_final_comment')
			.reply(200, finalCommentsForReview)
			.persist();
	});

	afterEach(teardown);

	describe('GET /review-comments with data', () => {
		it('should render review LPA final comments page with the provided comments details', async () => {
			const response = await request.get(`${baseUrl}/2/final-comments/lpa`);

			expect(response.statusCode).toBe(200);

			const dom = parseHtml(response.text);
			const elementInnerHtml = dom.innerHTML;
			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('Review LPA final comments</h1>');

			const finalCommentsRow = parseHtml(response.text, {
				rootElement: '.govuk-summary-list__row:first-of-type'
			});

			expect(finalCommentsRow).not.toBeNull();
			const partyKey = finalCommentsRow?.querySelector('.govuk-summary-list__key');
			const finalCommentsValue = finalCommentsRow?.querySelector('.govuk-summary-list__value');
			expect(partyKey?.textContent?.trim()).toBe('Final comments');
			expect(finalCommentsValue?.textContent?.trim()).toBe('Awaiting final comments review');
		});

		it('should render review appellant final comments page with the provided comments details', async () => {
			nock('http://test/')
				.get('/appeals/2/reps?type=appellant_final_comment')
				.reply(200, finalCommentsForReview);
			const response = await request.get(`${baseUrl}/2/final-comments/appellant`);

			expect(response.statusCode).toBe(200);

			const dom = parseHtml(response.text);
			const elementInnerHtml = dom.innerHTML;
			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('Review appellant final comments</h1>');

			const finalCommentsRow = parseHtml(response.text, {
				rootElement: '.govuk-summary-list__row:first-of-type'
			});

			expect(finalCommentsRow).not.toBeNull();
			const partyKey = finalCommentsRow?.querySelector('.govuk-summary-list__key');
			const finalCommentsValue = finalCommentsRow?.querySelector('.govuk-summary-list__value');
			expect(partyKey?.textContent?.trim()).toBe('Final comments');
			expect(finalCommentsValue?.textContent?.trim()).toBe('Awaiting final comments review');
		});

		it('should render review LPA final comments page with error if no option is selected', async () => {
			const response = await request.post(`${baseUrl}/2/final-comments/lpa`).send({
				status: ''
			});
			expect(response.statusCode).toBe(200);

			const dom = parseHtml(response.text);
			const elementInnerHtml = dom.innerHTML;
			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('There is a problem</h2>');
			expect(elementInnerHtml).toContain('Select the outcome of your review</a>');
		});
	});

	describe('GET /review-comments with no data', () => {
		beforeEach(() => {
			nock('http://test/').get('/appeals/2/reps/comments/999').reply(404, {});
		});

		it('should render 404 page when the comments is not found', async () => {
			const response = await request.get(`${baseUrl}/2/review/999`);

			expect(response.statusCode).toBe(404);

			const elementInnerHtml = parseHtml(response.text).innerHTML;
			expect(elementInnerHtml).toContain('Page not found');
		});
	});
});
