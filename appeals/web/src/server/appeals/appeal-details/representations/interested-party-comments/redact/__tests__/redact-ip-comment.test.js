import {
	appealDataFullPlanning,
	interestedPartyCommentForReview
} from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';

describe('redact', () => {
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

		nock('http://test/').get('/appeals/2/reps/5').reply(200, interestedPartyCommentForReview);

		nock('http://test/')
			.get('/appeals/2/document-folders?path=representation/representationAttachments')
			.reply(200, [{ folderId: 1234 }]);
	});

	afterEach(teardown);

	it('renders the redact page', async () => {
		const response = await request.get(`${baseUrl}/2/interested-party-comments/5/redact`);

		expect(response.statusCode).toBe(200);

		const { innerHTML } = parseHtml(response.text);
		expect(innerHTML).toMatchSnapshot();
		expect(innerHTML).toContain('Revert to original comment</button>');
		expect(innerHTML).toContain('Check details and redact comment');
		expect(innerHTML).toContain('Awaiting review comment 47');
	});

	it('should render the correct back link', async () => {
		const response = await request.get(`${baseUrl}/2/interested-party-comments/5/redact`);

		expect(response.statusCode).toBe(200);

		const page = parseHtml(response.text, { rootElement: 'body' });
		expect(page.querySelector('.govuk-back-link')?.getAttribute('href')).toBe(
			`${baseUrl}/2/interested-party-comments/3670/review`
		);
	});

	it('should render the correct back link when editing', async () => {
		const response = await request.get(
			`${baseUrl}/2/interested-party-comments/5/redact` +
				`?editEntrypoint=${baseUrl}/2/interested-party-comments/5/redact`
		);

		expect(response.statusCode).toBe(200);

		const page = parseHtml(response.text, { rootElement: 'body' });
		expect(page.querySelector('.govuk-back-link')?.getAttribute('href')).toBe(
			`${baseUrl}/2/interested-party-comments/3670/redact/confirm`
		);
	});

	it('renders the confirm redaction page', async () => {
		const response = await request.get(`${baseUrl}/2/interested-party-comments/5/redact/confirm`);

		expect(response.statusCode).toBe(200);

		const { innerHTML } = parseHtml(response.text);
		expect(innerHTML).toMatchSnapshot();
		expect(innerHTML).toContain('Redact and accept comment');
		expect(innerHTML).toContain('Awaiting review comment 47');
	});

	it('renders the original comment in a show more component on the redact page', async () => {
		const response = await request.get(`${baseUrl}/2/interested-party-comments/5/redact`);

		expect(response.statusCode).toBe(200);

		const page = parseHtml(response.text, { rootElement: 'body' });
		expect(page.querySelector('#original-comment .pins-show-more')?.textContent?.trim()).toBe(
			'Awaiting review comment 47'
		);
	});

	it('renders the original and redacted comments in show more components on the confirm page', async () => {
		nock('http://test/')
			.get('/appeals/2/reps/5')
			.reply(200, interestedPartyCommentForReview)
			.persist();

		const redactedRepresentation = 'Test redacted comment text';
		const postResponse = await request
			.post(`${baseUrl}/2/interested-party-comments/5/redact`)
			.send({ redactedRepresentation });

		expect(postResponse.statusCode).toBe(302);

		const response = await request.get(`${baseUrl}/2/interested-party-comments/5/redact/confirm`);

		expect(response.statusCode).toBe(200);

		const unprettifiedHTML = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;
		expect(unprettifiedHTML).toContain('Original comment</dt>');
		expect(unprettifiedHTML).toContain(
			'class="pins-show-more" data-label="" data-mode="html">Awaiting review comment 47</div>'
		);
		expect(unprettifiedHTML).toContain('Redacted comment</dt>');
		expect(unprettifiedHTML).toContain(
			`class="pins-show-more" data-label="" data-mode="html">${redactedRepresentation}</div>`
		);
	});

	it('renders the unredacted comment in a show more component on the confirm page', async () => {
		nock('http://test/')
			.get('/appeals/2/reps/5')
			.reply(200, interestedPartyCommentForReview)
			.persist();

		const postResponse = await request
			.post(`${baseUrl}/2/interested-party-comments/5/redact`)
			.send({ redactedRepresentation: interestedPartyCommentForReview.originalRepresentation });

		expect(postResponse.statusCode).toBe(302);

		const response = await request.get(`${baseUrl}/2/interested-party-comments/5/redact/confirm`);

		expect(response.statusCode).toBe(200);

		const unprettifiedHTML = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;
		expect(unprettifiedHTML).toContain('Comment</dt>');
		expect(unprettifiedHTML).not.toContain('Redacted comment</dt>');
		expect(unprettifiedHTML).toContain(
			'class="pins-show-more" data-label="" data-mode="html">Awaiting review comment 47</div>'
		);
	});
});
