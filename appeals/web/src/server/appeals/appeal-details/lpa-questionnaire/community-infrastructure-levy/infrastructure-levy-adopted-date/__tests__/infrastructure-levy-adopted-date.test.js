import {
	appealData,
	lpaQuestionnaireDataNotValidated
} from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const appealId = appealData.appealId;
const lpaQuestionnaireId = appealData.lpaQuestionnaireId;
const baseUrl = `/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}`;

describe('infrastructure-levy-adopted-date', () => {
	beforeEach(installMockApi), afterEach(teardown);

	describe('GET /change', () => {
		it('should render the infrastructure levy adopted date change page', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`)
				.reply(200, lpaQuestionnaireDataNotValidated);

			const response = await request.get(`${baseUrl}/infrastructure-levy-adopted-date/change`);

			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();

			const unprettifiedInnerHtml = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

			expect(unprettifiedInnerHtml).toContain(
				'When was the community infrastructure levy formally adopted?</h1>'
			);
			expect(unprettifiedInnerHtml).toContain(
				'name="levy-adopted-date-day" type="text" inputmode="numeric">'
			);
			expect(unprettifiedInnerHtml).toContain(
				'name="levy-adopted-date-month" type="text" inputmode="numeric">'
			);
			expect(unprettifiedInnerHtml).toContain(
				'name="levy-adopted-date-year" type="text" inputmode="numeric">'
			);
			expect(unprettifiedInnerHtml).toContain('Continue</button>');
		});
	});

	describe('POST /change', () => {
		it('should navigate to the LPA Questionnaire page when a valid levy adoption date is provided', async () => {
			const monthVariants = ['06', 'Jun', 'June'];
			for (const month of monthVariants) {
				const validData = {
					'levy-adopted-date-day': '11',
					'levy-adopted-date-month': month,
					'levy-adopted-date-year': '2021'
				};

				nock('http://test/')
					.get(`/appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`)
					.reply(200, lpaQuestionnaireDataNotValidated);
				nock('http://test/')
					.patch(`/appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`)
					.reply(200, {});

				const response = await request
					.post(`${baseUrl}/infrastructure-levy-adopted-date/change`)
					.send(validData);

				expect(response.statusCode).toBe(302);
				expect(response.text).toBe(
					`Found. Redirecting to /appeals-service/appeal-details/1/lpa-questionnaire/${lpaQuestionnaireId}`
				);
			}
		});

		it('should re-render the levy adoption date change page if day is not valid', async () => {
			const testCases = [
				{ value: '', expectedError: 'Date must include a day' },
				{ value: 'a', expectedError: 'Date day must be a number' },
				{ value: '0', expectedError: 'Date day must be between 1 and 31' },
				{ value: '32', expectedError: 'Date day must be between 1 and 31' }
			];

			for (const testCase of testCases) {
				const invalidData = {
					'levy-adopted-date-day': testCase.value,
					'levy-adopted-date-month': '06',
					'levy-adopted-date-year': '2021'
				};
				nock('http://test/')
					.get(`/appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`)
					.reply(200, lpaQuestionnaireDataNotValidated);
				nock('http://test/')
					.patch(`/appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`)
					.reply(200, {});

				const response = await request
					.post(`${baseUrl}/infrastructure-levy-adopted-date/change`)
					.send(invalidData);
				expect(response.statusCode).toBe(200);

				const elementInnerHtml = parseHtml(response.text).innerHTML;

				expect(elementInnerHtml).toMatchSnapshot();
				expect(elementInnerHtml).toContain(
					'When was the community infrastructure levy formally adopted?</h1>'
				);

				const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
					rootElement: '.govuk-error-summary',
					skipPrettyPrint: true
				}).innerHTML;

				expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
				expect(unprettifiedErrorSummaryHtml).toContain(`${testCase.expectedError}</a>`);
			}
		});

		it('should re-render the levy adoption date change page with an error message if the provided date month is invalid', async () => {
			const testCases = [
				{ value: '', expectedError: 'Date must include a month' },
				{
					value: 'a',
					expectedError: 'Date must be a real date'
				},
				{ value: '0', expectedError: 'Date month must be between 1 and 12' },
				{ value: '13', expectedError: 'Date month must be between 1 and 12' }
			];

			for (const testCase of testCases) {
				const invalidData = {
					'levy-adopted-date-day': '1',
					'levy-adopted-date-month': testCase.value,
					'levy-adopted-date-year': '2021'
				};
				nock('http://test/')
					.get(`/appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`)
					.reply(200, lpaQuestionnaireDataNotValidated);
				nock('http://test/')
					.patch(`/appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`)
					.reply(200, {});

				const response = await request
					.post(`${baseUrl}/infrastructure-levy-adopted-date/change`)
					.send(invalidData);
				expect(response.statusCode).toBe(200);

				const elementInnerHtml = parseHtml(response.text).innerHTML;

				expect(elementInnerHtml).toMatchSnapshot();
				expect(elementInnerHtml).toContain(
					'When was the community infrastructure levy formally adopted?</h1>'
				);

				const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
					rootElement: '.govuk-error-summary',
					skipPrettyPrint: true
				}).innerHTML;

				expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
				expect(unprettifiedErrorSummaryHtml).toContain(`${testCase.expectedError}</a>`);
			}
		});

		it('should re-render the levy adoption date change page with an error message if the provided date year is invalid', async () => {
			const testCases = [
				{ value: '', expectedError: 'Date must include a year' },
				{ value: 'a', expectedError: 'Date year must be a number' },
				{ value: '202', expectedError: 'Date year must be 4 digits' }
			];

			for (const testCase of testCases) {
				const invalidData = {
					'levy-adopted-date-day': '1',
					'levy-adopted-date-month': '11',
					'levy-adopted-date-year': testCase.value
				};
				nock('http://test/')
					.get(`/appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`)
					.reply(200, lpaQuestionnaireDataNotValidated);
				nock('http://test/')
					.patch(`/appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`)
					.reply(200, {});

				const response = await request
					.post(`${baseUrl}/infrastructure-levy-adopted-date/change`)
					.send(invalidData);
				expect(response.statusCode).toBe(200);

				const elementInnerHtml = parseHtml(response.text).innerHTML;

				expect(elementInnerHtml).toMatchSnapshot();
				expect(elementInnerHtml).toContain(
					'When was the community infrastructure levy formally adopted?'
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
