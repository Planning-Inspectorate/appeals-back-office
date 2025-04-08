import {
	appealDataFullPlanning,
	finalCommentsForReview,
	lpaStatementAwaitingReview,
	getAppealRepsResponse
} from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';

describe('lpa-statements', () => {
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
			.get('/appeals/2/document-folders')
			.query({ path: 'representation/representationAttachments' })
			.reply(200, [{ folderId: 1234, path: 'representation/attachments' }]);

		nock('http://test/')
			.get('/appeals/2/reps?type=lpa_statement')
			.reply(200, finalCommentsForReview) // TODO: this should be LPA statement data, not final comment data
			.persist();

		nock('http://test/')
			.get('/appeals/2/document-folders?path=representation/representationAttachments')
			.reply(200, [{ folderId: 1234, path: 'representation/attachments' }]);
	});

	afterEach(teardown);

	describe('GET /', () => {
		const appealId = 3;

		beforeEach(() => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, {
					...appealDataFullPlanning,
					appealId,
					appealStatus: 'statements'
				});
		});

		it('should render the redact LPA ststement page successfully', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}/reps?type=lpa_statement`)
				.reply(200, {
					...getAppealRepsResponse,
					itemCount: 1,
					items: [lpaStatementAwaitingReview]
				});

			const response = await request.get(`${baseUrl}/${appealId}/lpa-statement/redact`);

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Revert to original LPA statement</button>');
			expect(element.innerHTML).toContain('Undo changes</button>');
			expect(element.innerHTML).toContain('Redact selected text</button>');
			expect(element.innerHTML).toContain('Redacted statement');
			expect(element.innerHTML).toContain('Original statement');
		});

		it('should render the redacted LPA statement page', async () => {
			nock('http://test/').get(`/appeals/${appealId}/reps?type=lpa_statement`).reply(500, {});

			const response = await request.get(`${baseUrl}/${appealId}/lpa-statement/redact`);

			expect(response.statusCode).toBe(500);

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Sorry, there is a problem with the service');
		});
	});
});
