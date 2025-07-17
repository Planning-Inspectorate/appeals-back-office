import {
	appealDataFullPlanning,
	lpaStatementAwaitingReview,
	getAppealRepsResponse,
	allocationDetailsData
} from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';
const appealId = 2;

describe('redact', () => {
	beforeEach(() => {
		installMockApi();

		nock('http://test/')
			.get(`/appeals/${appealId}/reps?type=lpa_statement`)
			.reply(200, {
				...getAppealRepsResponse,
				itemCount: 1,
				items: [
					{
						...lpaStatementAwaitingReview
					}
				]
			})
			.persist();
		nock('http://test/')
			.get('/appeals/appeal-allocation-levels')
			.reply(200, allocationDetailsData.levels)
			.persist();
		nock('http://test/')
			.get('/appeals/appeal-allocation-specialisms')
			.reply(200, allocationDetailsData.specialisms)
			.persist();
	});

	afterEach(() => {
		teardown;
		nock.cleanAll();
	});

	describe('GET /', () => {
		it('should render the redact lpa statement page with expected content', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, {
					...appealDataFullPlanning,
					appealId,
					appealStatus: 'statements'
				});

			const response = await request.get(`${baseUrl}/${appealId}/lpa-statement/redact`);

			expect(response.statusCode).toBe(200);

			const { innerHTML } = parseHtml(response.text);
			expect(innerHTML).toMatchSnapshot();

			expect(innerHTML).toContain('Appeal 351062</span>');
			expect(innerHTML).toContain(`Redact LPA statement</h1>`);
			expect(innerHTML).toContain('Original statement:</p>');
			expect(innerHTML).toContain(
				`<div id="original-comment" class="govuk-inset-text govuk-!-margin-top-2">`
			);
			expect(innerHTML).toContain(
				'<label class="govuk-label govuk-label--s" for="redact-textarea">Redacted statement</label>'
			);
			expect(innerHTML).toContain('Redact selected text</button>');
			expect(innerHTML).toContain('Undo changes</button>');
			expect(innerHTML).toContain('Continue</button>');
		});
	});

	describe('POST /', () => {
		it(`should redirect to the redact lpa statement allocation check page if allocation details already present`, async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, {
					...appealDataFullPlanning,
					appealId,
					appealStatus: 'statements'
				});

			const response = await request.post(`${baseUrl}/${appealId}/lpa-statement/redact`).send({
				redactedRepresentation: 'Test redacted final comment text'
			});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				`Found. Redirecting to /appeals-service/appeal-details/${appealId}/lpa-statement/redact/allocation-check`
			);
		});

		it(`should redirect to the redact lpa statement allocation level page if no allocation details present`, async () => {
			nock.cleanAll();

			nock('http://test/')
				.get(`/appeals/${appealId}/reps?type=lpa_statement`)
				.reply(200, {
					...getAppealRepsResponse,
					itemCount: 1,
					items: [
						{
							...lpaStatementAwaitingReview
						}
					]
				});

			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, {
					...appealDataFullPlanning,
					appealId,
					appealStatus: 'statements',
					allocationDetails: null
				});

			const response = await request.post(`${baseUrl}/${appealId}/lpa-statement/redact`).send({
				redactedRepresentation: 'Test redacted lpa statement text'
			});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				`Found. Redirecting to /appeals-service/appeal-details/${appealId}/lpa-statement/redact/allocation-level`
			);
		});
	});

	describe('GET /allocation-check', () => {
		it('should render the allocation check page with expected content', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, {
					...appealDataFullPlanning,
					allocationDetails: null,
					appealId,
					appealStatus: 'statements'
				});

			const response = await request.get(
				`${baseUrl}/${appealId}/lpa-statement/redact/allocation-check`
			);
			expect(response.statusCode).toBe(200);
			const { innerHTML } = parseHtml(response.text);
			expect(innerHTML).toMatchSnapshot();

			expect(innerHTML).toContain('Appeal 351062</span>');
			expect(innerHTML).toContain('Allocation level</h1>');
			expect(innerHTML).toContain(
				'Do you need to update the allocation level and specialisms?</legend>'
			);
			expect(innerHTML).toContain('name="allocationLevelAndSpecialisms" type="radio" value="yes">');
			expect(innerHTML).toContain('name="allocationLevelAndSpecialisms" type="radio" value="no">');
			expect(innerHTML).toContain('Continue</button>');
		});

		it('should render a back link to the redact LPA statement page', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, {
					...appealDataFullPlanning,
					appealId,
					appealStatus: 'statements'
				});

			const response = await request.get(
				`${baseUrl}/${appealId}/lpa-statement/redact/allocation-check`
			);

			expect(response.statusCode).toBe(200);

			const unprettifiedHtml = parseHtml(response.text, {
				rootElement: 'body',
				skipPrettyPrint: true
			}).innerHTML;

			expect(unprettifiedHtml).toContain(
				`href="/appeals-service/appeal-details/${appealId}/lpa-statement/redact" class="govuk-back-link">Back</a>`
			);
		});
	});

	describe('GET /allocation-level', () => {
		it('should render the allocation level page with expected content', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, {
					...appealDataFullPlanning,
					allocationDetails: null,
					appealId,
					appealStatus: 'statements'
				});

			const response = await request.get(
				`${baseUrl}/${appealId}/lpa-statement/redact/allocation-level`
			);
			expect(response.statusCode).toBe(200);
			const { innerHTML } = parseHtml(response.text);
			expect(innerHTML).toMatchSnapshot();

			expect(innerHTML).toContain('Appeal 351062</span>');
			expect(innerHTML).toContain(`Allocation level</h1>`);
			expect(innerHTML).toContain(
				`<label class="govuk-label govuk-radios__label" for="allocationLevel">A</label>`
			);
			expect(innerHTML).toContain(
				`<label class="govuk-label govuk-radios__label" for="allocationLevel-2">B</label>`
			);
			expect(innerHTML).toContain('Continue</button>');
		});

		it('should render a back link to the redact LPA statement page, if the appeal has no allocation level or allocation specialisms (i.e. redact page was previous page, allocation check was skipped because user must update allocation info)', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, {
					...appealDataFullPlanning,
					allocationDetails: null,
					appealId,
					appealStatus: 'statements'
				});

			const reviewPageResponse = await request.post(`${baseUrl}/${appealId}/lpa-statement`).send({
				status: 'valid_requires_redaction'
			});

			expect(reviewPageResponse.statusCode).toBe(302);

			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, {
					...appealDataFullPlanning,
					allocationDetails: null,
					appealId,
					appealStatus: 'statements'
				});

			const redactPageResponse = await request
				.post(`${baseUrl}/${appealId}/lpa-statement/redact`)
				.send({
					redactedRepresentation: 'Test redacted final comment text'
				});

			expect(redactPageResponse.statusCode).toBe(302);

			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, {
					...appealDataFullPlanning,
					allocationDetails: null,
					appealId,
					appealStatus: 'statements'
				});

			const response = await request.get(
				`${baseUrl}/${appealId}/lpa-statement/redact/allocation-level`
			);

			expect(response.statusCode).toBe(200);

			const unprettifiedHtml = parseHtml(response.text, {
				rootElement: 'body',
				skipPrettyPrint: true
			}).innerHTML;

			expect(unprettifiedHtml).toContain(
				`href="/appeals-service/appeal-details/${appealId}/lpa-statement/redact" class="govuk-back-link">Back</a>`
			);
		});

		it('should render a back link to the allocation check page, if the appeal has both an allocation level and allocation specialisms (i.e. allocation check was previous page because user was given the option to update allocation info or not)', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, {
					...appealDataFullPlanning,
					appealId,
					appealStatus: 'statements'
				});

			const reviewPageResponse = await request.post(`${baseUrl}/${appealId}/lpa-statement`).send({
				status: 'valid_requires_redaction'
			});

			expect(reviewPageResponse.statusCode).toBe(302);

			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, {
					...appealDataFullPlanning,
					appealId,
					appealStatus: 'statements'
				});

			const redactPageResponse = await request
				.post(`${baseUrl}/${appealId}/lpa-statement/redact`)
				.send({
					redactedRepresentation: 'Test redacted final comment text'
				});

			expect(redactPageResponse.statusCode).toBe(302);

			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, {
					...appealDataFullPlanning,
					appealId,
					appealStatus: 'statements'
				});

			const response = await request.get(
				`${baseUrl}/${appealId}/lpa-statement/redact/allocation-level`
			);

			expect(response.statusCode).toBe(200);

			const unprettifiedHtml = parseHtml(response.text, {
				rootElement: 'body',
				skipPrettyPrint: true
			}).innerHTML;

			expect(unprettifiedHtml).toContain(
				`href="/appeals-service/appeal-details/${appealId}/lpa-statement/redact/allocation-check" class="govuk-back-link">Back</a>`
			);
		});
	});

	describe('GET /allocation-specialisms', () => {
		it('should render the allocation specialisms page with expected content', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, {
					...appealDataFullPlanning,
					appealId,
					appealStatus: 'statements'
				});

			const response = await request.get(
				`${baseUrl}/${appealId}/lpa-statement/redact/allocation-specialisms`
			);
			expect(response.statusCode).toBe(200);

			const { innerHTML } = parseHtml(response.text);

			expect(innerHTML).toMatchSnapshot();
			expect(innerHTML).toContain('Appeal 351062</span>');
			expect(innerHTML).toContain(`Allocation specialisms</h1>`);
			expect(innerHTML).toContain(
				`<label class="govuk-label govuk-checkboxes__label" for="allocationSpecialisms">Specialism 1</label>`
			);
			expect(innerHTML).toContain(
				`<label class="govuk-label govuk-checkboxes__label" for="allocationSpecialisms-2">Specialism 2</label>`
			);
			expect(innerHTML).toContain(
				`<label class="govuk-label govuk-checkboxes__label" for="allocationSpecialisms-3">Specialism 3</label>`
			);
			expect(innerHTML).toContain('Continue</button>');
		});

		it('should render a back link to the redact journey version of the allocation level page', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, {
					...appealDataFullPlanning,
					appealId,
					appealStatus: 'statements'
				});

			const response = await request.get(
				`${baseUrl}/${appealId}/lpa-statement/redact/allocation-specialisms`
			);
			expect(response.statusCode).toBe(200);

			const { innerHTML } = parseHtml(response.text, {
				rootElement: 'body',
				skipPrettyPrint: true
			});

			expect(innerHTML).toContain(
				`href="/appeals-service/appeal-details/${appealId}/lpa-statement/redact/allocation-level" class="govuk-back-link"`
			);
		});
	});

	describe('GET /confirm', () => {
		it('should render the CYA redaction page with expected content', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}`)
				.reply(200, {
					...appealDataFullPlanning,
					appealId,
					appealStatus: 'statements'
				});

			const response = await request.get(`${baseUrl}/${appealId}/lpa-statement/redact/confirm`);

			expect(response.statusCode).toBe(200);

			const { innerHTML } = parseHtml(response.text);
			expect(innerHTML).toMatchSnapshot();

			expect(innerHTML).toContain(
				'<h1 class="govuk-heading-l">Check details and accept statement</h1>'
			);
			expect(innerHTML).toContain('Original statement</dt>');
			expect(innerHTML).toContain('Redacted statement</dt>');
			expect(innerHTML).toContain('Supporting documents</dt>');
			expect(innerHTML).toContain('Review decision</dt>');
			expect(innerHTML).toContain('Redact and accept statement');
		});
	});
});
