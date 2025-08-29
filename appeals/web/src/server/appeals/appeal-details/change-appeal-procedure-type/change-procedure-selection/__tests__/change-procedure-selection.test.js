import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';
import { createTestEnvironment } from '#testing/index.js';
import { appealData } from '#testing/appeals/appeals.js';

const { app, teardown } = createTestEnvironment();
const request = supertest(app);
const appealDataWithoutStartDate = {
	...appealData,
	startedAt: null
};

describe('Change procedure type', () => {
	afterEach(teardown);

	describe('GET /change-appeal-procedure-type/change-selected-procedure-type Written', () => {
		it('should render the select procedure page with the expected content', async () => {
			nock('http://test/')
				.get('/appeals/1')
				.reply(200, {
					...appealDataWithoutStartDate,
					appealType: 'Planning appeal'
				});

			const response = await request.get(
				'/appeals-service/appeal-details/1/change-appeal-procedure-type/change-selected-procedure-type'
			);

			expect(response.statusCode).toBe(200);

			const html = parseHtml(response.text).innerHTML;

			expect(html).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: 'body',
				skipPrettyPrint: true
			});

			expect(unprettifiedElement.innerHTML).toContain(
				'href="/appeals-service/appeal-details/1" class="govuk-back-link">Back</a>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'<span class="govuk-caption-l">Appeal 351062 - update appeal procedure</span>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Appeal procedure</h1>');
			expect(unprettifiedElement.innerHTML).toContain(
				`<label class="govuk-label govuk-radios__label" for="appeal-procedure"> Written representations</label>`
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="appealProcedure" type="radio" value="hearing">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="appealProcedure" type="radio" value="inquiry">'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});

		it('should render the select procedure page with the expected back link URL, if the backLink query parameter was passed', async () => {
			nock('http://test/')
				.get('/appeals/1')
				.reply(200, {
					...appealDataWithoutStartDate,
					appealType: 'Planning appeal'
				});

			const response = await request.get(
				'/appeals-service/appeal-details/1/change-appeal-procedure-type/change-selected-procedure-type?backUrl=/test/back/url'
			);

			expect(response.statusCode).toBe(200);

			const unprettifiedElement = parseHtml(response.text, {
				rootElement: 'body',
				skipPrettyPrint: true
			});

			expect(unprettifiedElement.innerHTML).toContain(
				'href="/test/back/url" class="govuk-back-link">Back</a>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'<span class="govuk-caption-l">Appeal 351062 - update appeal procedure</span>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Appeal procedure</h1>');
			expect(unprettifiedElement.innerHTML).toContain(
				'for="appeal-procedure"> Written representations</label>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="appealProcedure" type="radio" value="hearing">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="appealProcedure" type="radio" value="inquiry">'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});

		it('should render the select procedure page with the expected radio option preselected if an appeal procedure is found in the session', async () => {
			nock('http://test/')
				.get('/appeals/1')
				.reply(200, {
					...appealDataWithoutStartDate,
					appealType: 'Planning appeal'
				});

			const selectProcedurePostResponse = await request
				.post(
					'/appeals-service/appeal-details/1/change-appeal-procedure-type/change-selected-procedure-type'
				)
				.send({
					appealProcedure: 'written'
				});

			expect(selectProcedurePostResponse.statusCode).toBe(302);
			expect(selectProcedurePostResponse.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/change-appeal-procedure-type/change-timetable'
			);

			nock('http://test/')
				.get('/appeals/1')
				.reply(200, {
					...appealDataWithoutStartDate,
					appealType: 'Planning appeal'
				});

			const response = await request.get(
				'/appeals-service/appeal-details/1/change-appeal-procedure-type/change-selected-procedure-type'
			);

			expect(response.statusCode).toBe(200);

			const unprettifiedHtml = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

			expect(unprettifiedHtml).toContain('Appeal procedure</h1>');
			expect(unprettifiedHtml).toContain(
				`<label class="govuk-label govuk-radios__label" for="appeal-procedure"> Written representations</label>`
			);
			expect(unprettifiedHtml).toContain(
				'name="appealProcedure" type="radio" value="written" checked>'
			);
			expect(unprettifiedHtml).toContain('name="appealProcedure" type="radio" value="inquiry">');
		});
	});

	describe('POST /change-appeal-procedure-type/change-selected-procedure-type Written to Written', () => {
		it('should re-render the select procedure page with the expected error message if no radio option was selected', async () => {
			nock('http://test/')
				.get('/appeals/1')
				.reply(200, {
					...appealDataWithoutStartDate,
					appealType: 'Planning appeal'
				});

			const response = await request
				.post(
					'/appeals-service/appeal-details/1/change-appeal-procedure-type/change-selected-procedure-type'
				)
				.send({});

			expect(response.statusCode).toBe(200);

			const html = parseHtml(response.text).innerHTML;

			expect(html).toMatchSnapshot();

			const unprettifiedHtml = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

			expect(unprettifiedHtml).toContain('Appeal procedure</h1>');

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				skipPrettyPrint: true,
				rootElement: '.govuk-error-summary'
			}).innerHTML;

			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain('Select the appeal procedure</a>');
		});

		it('should redirect to the timetable due page if a existing procedure is Written and change to Written', async () => {
			nock('http://test/')
				.get('/appeals/1')
				.reply(200, {
					...appealDataWithoutStartDate,
					appealType: 'Planning appeal'
				});

			const response = await request
				.post(
					'/appeals-service/appeal-details/1/change-appeal-procedure-type/change-selected-procedure-type'
				)
				.send({
					appealProcedure: 'written'
				});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/change-appeal-procedure-type/change-timetable'
			);
		});
	});

	describe('POST /change-appeal-procedure-type/change-selected-procedure-type Written to Hearing', () => {
		it('should re-render the select procedure page with the expected error message if no radio option was selected', async () => {
			nock('http://test/')
				.get('/appeals/1')
				.reply(200, {
					...appealDataWithoutStartDate,
					appealType: 'Planning appeal'
				});

			const response = await request
				.post(
					'/appeals-service/appeal-details/1/change-appeal-procedure-type/change-selected-procedure-type'
				)
				.send({});

			expect(response.statusCode).toBe(200);

			const html = parseHtml(response.text).innerHTML;

			expect(html).toMatchSnapshot();

			const unprettifiedHtml = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

			expect(unprettifiedHtml).toContain('Appeal procedure</h1>');

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				skipPrettyPrint: true,
				rootElement: '.govuk-error-summary'
			}).innerHTML;

			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain('Select the appeal procedure</a>');
		});

		it('should redirect to the timetable due page if a existing procedure is Written and change to Hearing', async () => {
			nock('http://test/')
				.get('/appeals/1')
				.reply(200, {
					...appealDataWithoutStartDate,
					appealType: 'Planning appeal'
				});

			const response = await request
				.post(
					'/appeals-service/appeal-details/1/change-appeal-procedure-type/change-selected-procedure-type'
				)
				.send({
					appealProcedure: 'hearing'
				});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/change-appeal-procedure-type/change-timetable'
			);
		});
	});
});
