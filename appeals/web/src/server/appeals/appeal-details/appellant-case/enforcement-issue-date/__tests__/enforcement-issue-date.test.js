import { appealData, appellantCaseDataNotValidated } from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const appealId = appealData.appealId;
const appellantCaseId = appealData.appellantCaseId;
const appellantCaseUrl = `/appeals-service/appeal-details/${appealId}/appellant-case`;
const legendText = 'What is the issue date on your enforcement notice?';

describe('enforcement-issue-date', () => {
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('GET /change', () => {
		it('should render the enforcementIssueDate change page', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
				.reply(200, appellantCaseDataNotValidated);
			const response = await request.get(`${appellantCaseUrl}/enforcement-issue-date/change`);

			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain(`${legendText}</h1>`);
		});
	});

	describe('POST /change', () => {
		it('should re-direct to appellant-case if date is valid', async () => {
			const validData = {
				'enforcement-issue-date-day': '11',
				'enforcement-issue-date-month': 'July',
				'enforcement-issue-date-year': '2021'
			};

			nock('http://test/')
				.patch(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
				.reply(200, validData);

			const response = await request
				.post(`${appellantCaseUrl}/enforcement-issue-date/change`)
				.send(validData);

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/appellant-case'
			);
		});

		it('should re-render application submission date change page if day is not valid', async () => {
			const testCases = [
				{ value: '', expectedError: 'The issue date must include a day' },
				{ value: 'a', expectedError: 'The issue date day must be a number' },
				{ value: '0', expectedError: 'The issue date day must be between 1 and 31' },
				{ value: '32', expectedError: 'The issue date day must be between 1 and 31' }
			];

			for (const testCase of testCases) {
				const invalidData = {
					'enforcement-issue-date-day': testCase.value,
					'enforcement-issue-date-month': '06',
					'enforcement-issue-date-year': '2021'
				};
				nock('http://test/')
					.get(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
					.reply(200, appellantCaseDataNotValidated);

				const response = await request
					.post(`${appellantCaseUrl}/enforcement-issue-date/change`)
					.send(invalidData);
				expect(response.statusCode).toBe(200);

				const elementInnerHtml = parseHtml(response.text).innerHTML;

				expect(elementInnerHtml).toMatchSnapshot();
				expect(elementInnerHtml).toContain(`${legendText}</h1>`);

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
				{ value: '', expectedError: 'The issue date must include a month' },
				{
					value: 'a',
					expectedError: 'The issue date must be a real date'
				},
				{ value: '0', expectedError: 'The issue date month must be between 1 and 12' },
				{ value: '13', expectedError: 'The issue date month must be between 1 and 12' }
			];

			for (const testCase of testCases) {
				const invalidData = {
					'enforcement-issue-date-day': '1',
					'enforcement-issue-date-month': testCase.value,
					'enforcement-issue-date-year': '2021'
				};
				nock('http://test/')
					.get(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
					.reply(200, appellantCaseDataNotValidated);

				const response = await request
					.post(`${appellantCaseUrl}/enforcement-issue-date/change`)
					.send(invalidData);
				expect(response.statusCode).toBe(200);

				const elementInnerHtml = parseHtml(response.text).innerHTML;

				expect(elementInnerHtml).toMatchSnapshot();
				expect(elementInnerHtml).toContain(`${legendText}</h1>`);

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
				{ value: '', expectedError: 'The issue date must include a year' },
				{ value: 'a', expectedError: 'The issue date year must be a number' },
				{ value: '202', expectedError: 'The issue date year must be 4 digits' },
				{ value: '3000', expectedError: 'The issue date must be today or in the past' }
			];

			for (const testCase of testCases) {
				const invalidData = {
					'enforcement-issue-date-day': '1',
					'enforcement-issue-date-month': 'Jul',
					'enforcement-issue-date-year': testCase.value
				};
				nock('http://test/')
					.get(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
					.reply(200, appellantCaseDataNotValidated);

				const response = await request
					.post(`${appellantCaseUrl}/enforcement-issue-date/change`)
					.send(invalidData);
				expect(response.statusCode).toBe(200);

				const elementInnerHtml = parseHtml(response.text).innerHTML;

				expect(elementInnerHtml).toMatchSnapshot();
				expect(elementInnerHtml).toContain(`${legendText}</h1>`);

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
