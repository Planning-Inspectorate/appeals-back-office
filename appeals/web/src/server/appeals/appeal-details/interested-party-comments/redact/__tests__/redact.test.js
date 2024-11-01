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
			.get('/appeals/2')
			.reply(200, {
				...appealDataFullPlanning,
				appealId: 2,
				appealStatus: 'statements'
			});

		nock('http://test/').get('/appeals/2/reps/5').reply(200, interestedPartyCommentForReview);
	});

	afterEach(teardown);

	it('renders the redact page', async () => {
		const response = await request.get(`${baseUrl}/2/interested-party-comments/5/redact`);

		expect(response.statusCode).toBe(200);

		const { innerHTML } = parseHtml(response.text);
		expect(innerHTML).toMatchSnapshot();

		expect(innerHTML).toContain('Redact comment from Lee Thornton');
		expect(innerHTML).toContain('Awaiting review comment 47');
	});

	it('renders the confirm redaction page', async () => {
		const response = await request.get(`${baseUrl}/2/interested-party-comments/5/redact/confirm`);

		expect(response.statusCode).toBe(200);

		const { innerHTML } = parseHtml(response.text);
		expect(innerHTML).toMatchSnapshot();

		expect(innerHTML).toContain('Redact comment from Lee Thornton');
		expect(innerHTML).toContain(
			'<dd class="govuk-summary-list__value">Awaiting review comment 47</dd>'
		);
	});
});
