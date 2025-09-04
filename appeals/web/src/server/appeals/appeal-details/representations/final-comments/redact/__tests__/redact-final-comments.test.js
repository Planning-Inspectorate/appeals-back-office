/* eslint-disable jest/expect-expect */
import { findButtonText } from '#lib/revert-text.js';
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
const finalCommentsTypes = [
	{
		type: 'appellant',
		label: 'appellant',
		origin: 'citizen'
	},
	{
		type: 'lpa',
		label: 'LPA',
		origin: 'lpa'
	}
];

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

	describe('GET /', () => {
		for (const finalCommentsType of finalCommentsTypes) {
			it(`should render the redact ${finalCommentsType.type} final comments page with the expected content`, async () => {
				nock('http://test/')
					.get(`/appeals/2/reps?type=${finalCommentsType.type}_final_comment`)
					.reply(200, finalCommentsForReview)
					.persist();

				const response = await request.get(
					`${baseUrl}/2/final-comments/${finalCommentsType.type}/redact`
				);

				expect(response.statusCode).toBe(200);

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
				expect(unprettifiedHTML).toContain(`Redact ${finalCommentsType.label} final comments</h1>`);
				expect(unprettifiedHTML).toContain('Original final comments:</p>');
				expect(unprettifiedHTML).toContain(
					`id="original-comment" class="govuk-inset-text govuk-!-margin-top-2"><div class="pins-show-more" data-label="Read more" data-mode="html">Awaiting final comments review</div></div>`
				);
				expect(unprettifiedHTML).toContain('Awaiting final comments review</textarea>');
				expect(unprettifiedHTML).toContain('Redact selected text</button>');
				const buttonText = findButtonText(finalCommentsType.type);
				expect(unprettifiedHTML).toContain(`${buttonText}</button>`);
				expect(unprettifiedHTML).toContain('Undo changes</button>');
				expect(unprettifiedHTML).toContain('Continue</button>');
			});
		}
	});

	describe('POST /', () => {
		for (const finalCommentsType of finalCommentsTypes) {
			it(`should redirect to the redact ${finalCommentsType.type} final comments check your answers page`, async () => {
				nock('http://test/')
					.get(`/appeals/2/reps?type=${finalCommentsType.type}_final_comment`)
					.reply(200, finalCommentsForReview)
					.persist();

				const response = await request
					.post(`${baseUrl}/2/final-comments/${finalCommentsType.type}/redact`)
					.send({
						redactedRepresentation: 'Test redacted final comment text'
					});

				expect(response.statusCode).toBe(302);
				expect(response.text).toBe(
					`Found. Redirecting to /appeals-service/appeal-details/2/final-comments/${finalCommentsType.type}/redact/confirm`
				);
			});
		}
	});

	describe('GET /confirm', () => {
		for (const finalCommentsType of finalCommentsTypes) {
			it(`should render a 500 error page if redactedRepresentation is not present in the session (${finalCommentsType.type} final comments)`, async () => {
				nock('http://test/')
					.get(`/appeals/2/reps?type=${finalCommentsType.type}_final_comment`)
					.reply(200, finalCommentsForReview)
					.persist();

				const response = await request.get(
					`${baseUrl}/2/final-comments/${finalCommentsType.type}/redact/confirm`
				);

				expect(response.statusCode).toBe(500);

				const unprettifiedHTML = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

				expect(unprettifiedHTML).toContain('Sorry, there is a problem with the service</h1>');
			});

			it(`should render the check your answers page with the expected content if redactedRepresentation is present in the session (${finalCommentsType.type} final comments)`, async () => {
				nock('http://test/')
					.get(`/appeals/2/reps?type=${finalCommentsType.type}_final_comment`)
					.reply(200, finalCommentsForReview)
					.persist();

				const redactedRepresentation = 'Test redacted final comment text';
				const redactPagePostResponse = await request
					.post(`${baseUrl}/2/final-comments/${finalCommentsType.type}/redact`)
					.send({
						redactedRepresentation
					});

				expect(redactPagePostResponse.statusCode).toBe(302);

				const response = await request.get(
					`${baseUrl}/2/final-comments/${finalCommentsType.type}/redact/confirm`
				);

				expect(response.statusCode).toBe(200);

				const unprettifiedHTML = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

				expect(unprettifiedHTML).toContain(
					`Check details and accept ${finalCommentsType.label} final comments</h1>`
				);
				expect(unprettifiedHTML).toContain('Original final comments</dt>');
				expect(unprettifiedHTML).toContain(
					'class="pins-show-more" data-label="Read more" data-mode="html">Awaiting final comments review</div>'
				);
				expect(unprettifiedHTML).toContain('Redacted final comments</dt>');
				expect(unprettifiedHTML).toContain(
					`class="pins-show-more" data-label="Read more" data-mode="html">${redactedRepresentation}</div>`
				);
				expect(unprettifiedHTML).toContain(
					`href="/appeals-service/appeal-details/2/final-comments/${finalCommentsType.type}/redact?backUrl=/appeals-service/appeal-details/2/final-comments/${finalCommentsType.type}/redact/confirm">Change<span class="govuk-visually-hidden"> redacted final comments</span></a></dd>`
				);
				expect(unprettifiedHTML).toContain('Supporting documents</dt>');
				expect(unprettifiedHTML).toContain(`No documents</dd>`);
				expect(unprettifiedHTML).toContain('Review decision</dt>');
				expect(unprettifiedHTML).toContain('Redact and accept final comments</dd>');
				expect(unprettifiedHTML).toContain(
					`href="/appeals-service/appeal-details/2/final-comments/${finalCommentsType.type}?backUrl=/appeals-service/appeal-details/2/final-comments/${finalCommentsType.type}/redact/confirm">Change<span class="govuk-visually-hidden"> review decision</span></a></dd>`
				);
				expect(unprettifiedHTML).toContain(
					`Accept ${finalCommentsType.label} final comments</button></form>`
				);
			});
		}
	});

	describe('POST /confirm', () => {
		for (const finalCommentsType of finalCommentsTypes) {
			it(`should call the patch representation by ID endpoint with a status of 'valid' and redirect to the case details page (${finalCommentsType.type} final comments)`, async () => {
				nock('http://test/')
					.get(`/appeals/2/reps?type=${finalCommentsType.type}_final_comment`)
					.reply(200, finalCommentsForReview)
					.persist();

				const redactedRepresentation = 'Test redacted final comment text';
				const redactPagePostResponse = await request
					.post(`${baseUrl}/2/final-comments/${finalCommentsType.type}/redact`)
					.send({
						redactedRepresentation
					});

				expect(redactPagePostResponse.statusCode).toBe(302);

				const mockedPatchRepresentationEndpoint = nock('http://test/')
					.patch(`/appeals/2/reps/3670`)
					.reply(200, {
						...finalCommentsForReview.items[0],
						origin: finalCommentsType.origin,
						status: 'valid'
					});

				const response = await request
					.post(`${baseUrl}/2/final-comments/${finalCommentsType.type}/redact/confirm`)
					.send({});

				expect(mockedPatchRepresentationEndpoint.isDone()).toBe(true);
				expect(response.statusCode).toBe(302);
				expect(response.text).toBe(`Found. Redirecting to /appeals-service/appeal-details/2`);
			});
		}
	});
});
