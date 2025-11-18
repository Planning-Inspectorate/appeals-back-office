import {
	appealDataFullPlanning,
	finalCommentsForReview,
	representationRejectionReasons
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
			.get('/appeals/2?include=all')
			.reply(200, {
				...appealDataFullPlanning,
				appealId: 2,
				appealStatus: 'statements'
			})
			.persist();

		nock('http://test')
			.get('/appeals/representation-rejection-reasons?type=appellant_final_comment')
			.reply(200, representationRejectionReasons)
			.persist();
		nock('http://test')
			.get('/appeals/representation-rejection-reasons?type=lpa_final_comment')
			.reply(200, representationRejectionReasons)
			.persist();
		nock('http://test/')
			.get(`/appeals/2/reps?type=appellant_final_comment`)
			.reply(200, finalCommentsForReview)
			.persist();
		nock('http://test/')
			.get(`/appeals/2/reps?type=lpa_final_comment`)
			.reply(200, finalCommentsForReview)
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
			it(`should render the reject ${finalCommentsType.type} final comments page with the expected content`, async () => {
				const response = await request.get(
					`${baseUrl}/2/final-comments/${finalCommentsType.type}/reject`
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
				expect(unprettifiedHTML).toContain(`final comments?</h1>`);
				expect(unprettifiedHTML).toContain(
					`<div id="rejection-reason-hint" class="govuk-hint"> Select all that apply.</div>`
				);
				expect(unprettifiedHTML).toContain('Continue</button>');
			});
		}
	});

	describe('POST /', () => {
		for (const finalCommentsType of finalCommentsTypes) {
			it(`should redirect to the check your answers page`, async () => {
				const response = await request
					.post(`${baseUrl}/2/final-comments/${finalCommentsType.type}/reject`)
					.send({
						rejectionReason: ['1', '2'],
						'rejectionReason-7': ''
					});

				expect(response.statusCode).toBe(302);
				expect(response.text).toBe(
					`Found. Redirecting to /appeals-service/appeal-details/2/final-comments/${finalCommentsType.type}/reject/confirm`
				);
			});
		}
	});

	describe('GET /confirm', () => {
		for (const finalCommentsType of finalCommentsTypes) {
			it(`should render a 500 error page if rejectFinalComments is not present in the session`, async () => {
				const response = await request.get(
					`${baseUrl}/2/final-comments/${finalCommentsType.type}/reject/confirm`
				);

				expect(response.statusCode).toBe(500);

				const unprettifiedHTML = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

				expect(unprettifiedHTML).toContain('Sorry, there is a problem with the service</h1>');
			});

			it(`should render the check your answers page with the expected content if rejectFinalComments is present in the session`, async () => {
				const rejectPagePostResponse = await request
					.post(`${baseUrl}/2/final-comments/${finalCommentsType.type}/reject`)
					.send({
						rejectionReason: ['1', '2'],
						'rejectionReason-7': ''
					});

				expect(rejectPagePostResponse.statusCode).toBe(302);

				const response = await request.get(
					`${baseUrl}/2/final-comments/${finalCommentsType.type}/reject/confirm`
				);

				expect(response.statusCode).toBe(200);

				const unprettifiedHTML = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

				expect(unprettifiedHTML).toContain(
					`Check details and reject ${finalCommentsType.label} final comments</h1>`
				);
				expect(unprettifiedHTML).toContain('Final comments</dt>');
				expect(unprettifiedHTML).toContain('Supporting documents</dt>');
				expect(unprettifiedHTML).toContain(`No documents</dd>`);
				expect(unprettifiedHTML).toContain('Review decision</dt>');
				expect(unprettifiedHTML).toContain(
					`Why are you rejecting the ${finalCommentsType.label}&#39;s final comments?`
				);
				expect(unprettifiedHTML).toContain(
					`href="/appeals-service/appeal-details/2/final-comments/${finalCommentsType.type}?backUrl=/appeals-service/appeal-details/2/final-comments/${finalCommentsType.type}/reject/confirm">Change<span class="govuk-visually-hidden"> review decision</span></a></dd>`
				);
				expect(unprettifiedHTML).toContain(
					`Reject ${finalCommentsType.label} final comments</button></form>`
				);
			});
		}
	});
});
