import { parseHtml } from '@pins/platform';
import supertest from 'supertest';
import {
	appealData,
	lpaQuestionnaireDataNotValidated
} from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import nock from 'nock';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const appealId = appealData.appealId;
const lpaQuestionnaireId = appealData.lpaQuestionnaireId;
const baseUrl = `/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}`;

describe('infrastructure-levy-expected-date', () => {
	beforeEach(installMockApi), afterEach(teardown);

	describe('GET /change', () => {
		it('should render the infrastructure levy expected date change page', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`)
				.reply(200, lpaQuestionnaireDataNotValidated);

			const response = await request.get(`${baseUrl}/infrastructure-levy-expected-date/change`);

			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();

			const unprettifiedInnerHtml = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

			expect(unprettifiedInnerHtml).toContain(
				'When do you expect to formally adopt the community infrastructure levy?</h1>'
			);
			expect(unprettifiedInnerHtml).toContain(
				'name="levy-expected-date-day" type="text" inputmode="numeric">'
			);
			expect(unprettifiedInnerHtml).toContain(
				'name="levy-expected-date-month" type="text" inputmode="numeric">'
			);
			expect(unprettifiedInnerHtml).toContain(
				'name="levy-expected-date-year" type="text" inputmode="numeric">'
			);
			expect(unprettifiedInnerHtml).toContain('Continue</button>');
		});
	});

	describe('POST /change', () => {
		it('should re-direct to the LPA Questionnaire page if the date is valid', async () => {
			const validData = {
				'levy-expected-date-day': '11',
				'levy-expected-date-month': '06',
				'levy-expected-date-year': '2021'
			};

			nock('http://test/')
				.get(`/appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`)
				.reply(200, lpaQuestionnaireDataNotValidated);
			nock('http://test/')
				.patch(`/appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`)
				.reply(200, {});

			const response = await request
				.post(`${baseUrl}/infrastructure-levy-expected-date/change`)
				.send(validData);

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				`Found. Redirecting to /appeals-service/appeal-details/1/lpa-questionnaire/${lpaQuestionnaireId}`
			);
		});

		it('should re-render the expected levy adoption date change page if day is not valid', async () => {
			const testCases = [
				{ value: '', expectedError: 'Date must include a day' },
				{ value: 'a', expectedError: 'Date day must be a number' },
				{ value: '0', expectedError: 'Date day must be between 1 and 31' },
				{ value: '32', expectedError: 'Date day must be between 1 and 31' }
			];

			for (const testCase of testCases) {
				const invalidData = {
					'levy-expected-date-day': testCase.value,
					'levy-expected-date-month': '06',
					'levy-expected-date-year': '2021'
				};
				nock('http://test/')
					.get(`/appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`)
					.reply(200, lpaQuestionnaireDataNotValidated);
				nock('http://test/')
					.patch(`/appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`)
					.reply(200, {});

				const response = await request
					.post(`${baseUrl}/infrastructure-levy-expected-date/change`)
					.send(invalidData);
				expect(response.statusCode).toBe(200);

				const elementInnerHtml = parseHtml(response.text).innerHTML;

				expect(elementInnerHtml).toMatchSnapshot();
				expect(elementInnerHtml).toContain(
					'When do you expect to formally adopt the community infrastructure levy?</h1>'
				);

				const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
					rootElement: '.govuk-error-summary',
					skipPrettyPrint: true
				}).innerHTML;

				expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
				expect(unprettifiedErrorSummaryHtml).toContain(`${testCase.expectedError}</a>`);
			}
		});

		it('should re-render the expected levy adoption date change page with an error message if the provided date month is invalid', async () => {
			const testCases = [
				{ value: '', expectedError: 'Date must include a month' },
				{ value: 'a', expectedError: 'Date month must be a number' },
				{ value: '0', expectedError: 'Date month must be between 1 and 12' },
				{ value: '13', expectedError: 'Date month must be between 1 and 12' }
			];

			for (const testCase of testCases) {
				const invalidData = {
					'levy-expected-date-day': '1',
					'levy-expected-date-month': testCase.value,
					'levy-expected-date-year': '2021'
				};
				nock('http://test/')
					.get(`/appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`)
					.reply(200, lpaQuestionnaireDataNotValidated);
				nock('http://test/')
					.patch(`/appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`)
					.reply(200, {});

				const response = await request
					.post(`${baseUrl}/infrastructure-levy-expected-date/change`)
					.send(invalidData);
				expect(response.statusCode).toBe(200);

				const elementInnerHtml = parseHtml(response.text).innerHTML;

				expect(elementInnerHtml).toMatchSnapshot();
				expect(elementInnerHtml).toContain(
					'When do you expect to formally adopt the community infrastructure levy?</h1>'
				);

				const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
					rootElement: '.govuk-error-summary',
					skipPrettyPrint: true
				}).innerHTML;

				expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
				expect(unprettifiedErrorSummaryHtml).toContain(`${testCase.expectedError}</a>`);
			}
		});

		it('should re-render the levy expected date change page with an error message if the provided date year is invalid', async () => {
			const testCases = [
				{ value: '', expectedError: 'Date must include a year' },
				{ value: 'a', expectedError: 'Date year must be a number' },
				{ value: '202', expectedError: 'Date year must be 4 digits' }
			];

			for (const testCase of testCases) {
				const invalidData = {
					'levy-expected-date-day': '1',
					'levy-expected-date-month': '11',
					'levy-expected-date-year': testCase.value
				};
				nock('http://test/')
					.get(`/appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`)
					.reply(200, lpaQuestionnaireDataNotValidated);
				nock('http://test/')
					.patch(`/appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`)
					.reply(200, {});

				const response = await request
					.post(`${baseUrl}/infrastructure-levy-expected-date/change`)
					.send(invalidData);
				expect(response.statusCode).toBe(200);

				const elementInnerHtml = parseHtml(response.text).innerHTML;

				expect(elementInnerHtml).toMatchSnapshot();
				expect(elementInnerHtml).toContain(
					'When do you expect to formally adopt the community infrastructure levy?</h1>'
				);

				const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
					rootElement: '.govuk-error-summary',
					skipPrettyPrint: true
				}).innerHTML;

				expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
				expect(unprettifiedErrorSummaryHtml).toContain(`${testCase.expectedError}</a>`);
			}
		});
	});
});
