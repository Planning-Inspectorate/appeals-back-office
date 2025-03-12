/* eslint-disable jest/expect-expect */
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

		nock('http://test/')
			.get('/appeals/2')
			.reply(200, {
				...appealDataFullPlanning,
				appealId: 2,
				appealStatus: 'final_comments'
			})
			.persist();
	});

	afterEach(teardown);

	const finalCommentsTypes = [
		{
			type: 'appellant',
			label: 'appellant'
		},
		{
			type: 'lpa',
			label: 'LPA'
		}
	];

	describe('GET /', () => {
		for (const finalCommentsType of finalCommentsTypes) {
			it(`should render the accept ${finalCommentsType.type} final comments page with the expected content`, async () => {
				nock('http://test/')
					.get(`/appeals/2/reps?type=${finalCommentsType.type}_final_comment`)
					.reply(200, finalCommentsForReview)
					.persist();

				const response = await request.get(
					`${baseUrl}/2/final-comments/${finalCommentsType.type}/accept`
				);

				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedHTML = parseHtml(response.text, {
					skipPrettyPrint: true,
					rootElement: 'body'
				}).innerHTML;

				expect(unprettifiedHTML).toContain(
					`<a href="/appeals-service/appeal-details/2/final-comments/${finalCommentsType.type}" class="govuk-back-link">Back</a>`
				);
				expect(unprettifiedHTML).toContain('Appeal 351062</span>');
				expect(unprettifiedHTML).toContain(
					`Check details and accept ${finalCommentsType.label} final comments</h1>`
				);
				expect(unprettifiedHTML).toContain('Original final comments</dt>');
				expect(unprettifiedHTML).toContain('Awaiting final comments review</div>');
				expect(unprettifiedHTML).toContain('Supporting documents</dt>');
				expect(unprettifiedHTML).toContain('Review decisions</dt>');
				expect(unprettifiedHTML).toContain('Accept final comments</dd>');
				expect(unprettifiedHTML).toContain(
					`href="/appeals-service/appeal-details/2/final-comments/${finalCommentsType.type}`
				);
				expect(unprettifiedHTML).toContain(
					`Accept ${finalCommentsType.label} final comments</button>`
				);
			});
		}
	});

	describe('POST /', () => {
		for (const finalCommentsType of finalCommentsTypes) {
			it(`should call the patch rep status endpoint and redirect to the case details page`, async () => {
				nock('http://test/')
					.get(`/appeals/2/reps?type=${finalCommentsType.type}_final_comment`)
					.reply(200, finalCommentsForReview)
					.persist();

				const mockedPatchFinalCommentStatusEndpoint = nock('http://test/')
					.patch(`/appeals/2/reps/3670`)
					.reply(200, finalCommentsForReview.items[0])
					.persist();

				const response = await request
					.post(`${baseUrl}/2/final-comments/${finalCommentsType.type}/accept`)
					.send({
						status: 'valid'
					});
				expect(mockedPatchFinalCommentStatusEndpoint.isDone()).toBe(true);
				expect(response.statusCode).toBe(302);
				expect(response.text).toBe(`Found. Redirecting to /appeals-service/appeal-details/2`);
			});
		}
	});
});
