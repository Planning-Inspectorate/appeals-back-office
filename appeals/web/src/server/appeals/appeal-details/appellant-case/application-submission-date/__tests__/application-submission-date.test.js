import { parseHtml } from '@pins/platform';
import supertest from 'supertest';
import { appealData, appellantCaseDataNotValidated } from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import nock from 'nock';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const appealId = appealData.appealId;
const appellantCaseId = appealData.appellantCaseId;
const baseUrl = `/appeals-service/appeal-details/${appealId}/appellant-case`;
describe('application-date', () => {
	beforeEach(installMockApi), afterEach(teardown);

	describe('GET /change', () => {
		it('should render the applicationSubmissionDate change page', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
				.reply(200, appellantCaseDataNotValidated);
			const response = await request.get(`${baseUrl}/application-date/change`);

			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain('Change date application submitted</h1>');
		});
	});

	describe('POST /change', () => {
		it('should re-direct to appellant-case if date is valid', async () => {
			const validData = {
				'application-submission-date-day': '11',
				'application-submission-date-month': '06',
				'application-submission-date-year': '2021'
			};

			nock('http://test/')
				.patch(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
				.reply(200, validData);

			const response = await request.post(`${baseUrl}/application-date/change`).send(validData);

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/appellant-case'
			);
		});

		it('should re-render application submission date change page if day is not valid', async () => {
			const testCases = [
				{ value: '', expectedError: 'Date must include a day' },
				{ value: 'a', expectedError: 'Date day must be a number' },
				{ value: '0', expectedError: 'Date day must be between 1 and 31' },
				{ value: '32', expectedError: 'Date day must be between 1 and 31' }
			];

			for (const testCase of testCases) {
				const invalidData = {
					'application-submission-date-day': testCase.value,
					'application-submission-date-month': '06',
					'application-submission-date-year': '2021'
				};
				nock('http://test/')
					.get(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
					.reply(200, appellantCaseDataNotValidated);

				const response = await request.post(`${baseUrl}/application-date/change`).send(invalidData);
				expect(response.statusCode).toBe(200);

				const elementInnerHtml = parseHtml(response.text).innerHTML;

				expect(elementInnerHtml).toMatchSnapshot();
				expect(elementInnerHtml).toContain('Change date application submitted</h1>');

				const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
					rootElement: '.govuk-error-summary',
					skipPrettyPrint: true
				}).innerHTML;

				expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
				expect(unprettifiedErrorSummaryHtml).toContain(`${testCase.expectedError}</a>`);
			}
		});

		it('should re-render the Date page with an error message if the provided date month is invalid', async () => {
			const testCases = [
				{ value: '', expectedError: 'Date must include a month' },
				{ value: 'a', expectedError: 'Date month must be a number' },
				{ value: '0', expectedError: 'Date month must be between 1 and 12' },
				{ value: '13', expectedError: 'Date month must be between 1 and 12' }
			];

			for (const testCase of testCases) {
				const invalidData = {
					'application-submission-date-day': '1',
					'application-submission-date-month': testCase.value,
					'application-submission-date-year': '2021'
				};
				nock('http://test/')
					.get(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
					.reply(200, appellantCaseDataNotValidated);

				const response = await request.post(`${baseUrl}/application-date/change`).send(invalidData);
				expect(response.statusCode).toBe(200);

				const elementInnerHtml = parseHtml(response.text).innerHTML;

				expect(elementInnerHtml).toMatchSnapshot();
				expect(elementInnerHtml).toContain('Change date application submitted</h1>');

				const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
					rootElement: '.govuk-error-summary',
					skipPrettyPrint: true
				}).innerHTML;

				expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
				expect(unprettifiedErrorSummaryHtml).toContain(`${testCase.expectedError}</a>`);
			}
		});

		it('should re-render the Date page with an error message if the provided date year is invalid', async () => {
			const testCases = [
				{ value: '', expectedError: 'Date must include a year' },
				{ value: 'a', expectedError: 'Date year must be a number' },
				{ value: '202', expectedError: 'Date year must be 4 digits' },
				{ value: '3000', expectedError: 'Date must be today or in the past' }
			];

			for (const testCase of testCases) {
				const invalidData = {
					'application-submission-date-day': '1',
					'application-submission-date-month': '11',
					'application-submission-date-year': testCase.value
				};
				nock('http://test/')
					.get(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
					.reply(200, appellantCaseDataNotValidated);

				const response = await request.post(`${baseUrl}/application-date/change`).send(invalidData);
				expect(response.statusCode).toBe(200);

				const elementInnerHtml = parseHtml(response.text).innerHTML;

				expect(elementInnerHtml).toMatchSnapshot();
				expect(elementInnerHtml).toContain('Change date application submitted</h1>');

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
