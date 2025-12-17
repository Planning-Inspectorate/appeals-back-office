import { getExampleDateHint } from '#lib/dates.js';
import { appealData, appellantCaseDataNotValidated } from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { jest } from '@jest/globals';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const appealId = appealData.appealId;
const appellantCaseId = appealData.appellantCaseId;
const appellantCaseUrl = `/appeals-service/appeal-details/${appealId}/appellant-case`;
const legendText = 'What is the effective date on your enforcement notice?';

describe('enforcement-effective-date', () => {
	beforeAll(jest.clearAllMocks);
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('GET /change', () => {
		it('should render the enforcementEffectiveDate change page', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
				.reply(200, appellantCaseDataNotValidated);
			const response = await request.get(`${appellantCaseUrl}/enforcement-effective-date/change`);

			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toContain(`${legendText}</h1>`);
			expect(elementInnerHtml).toContain(`For example, ${getExampleDateHint(27)}</div>`);
		});
	});

	describe('POST /change', () => {
		it('should re-direct to appellant-case if date is valid', async () => {
			const validData = {
				'enforcement-effective-date-day': '11',
				'enforcement-effective-date-month': 'July',
				'enforcement-effective-date-year': '2021'
			};

			nock('http://test/')
				.patch(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
				.reply(200, validData);

			const response = await request
				.post(`${appellantCaseUrl}/enforcement-effective-date/change`)
				.send(validData);

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/appellant-case'
			);
		});

		it('should re-render application submission date change page if day is not valid', async () => {
			const testCases = [
				{ value: '', expectedError: 'The effective date must include a day' },
				{ value: 'a', expectedError: 'The effective date day must be a number' },
				{ value: '0', expectedError: 'The effective date day must be between 1 and 31' },
				{ value: '32', expectedError: 'The effective date day must be between 1 and 31' }
			];

			for (const testCase of testCases) {
				const invalidData = {
					'enforcement-effective-date-day': testCase.value,
					'enforcement-effective-date-month': '06',
					'enforcement-effective-date-year': '2021'
				};
				nock('http://test/')
					.get(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
					.reply(200, appellantCaseDataNotValidated);

				const response = await request
					.post(`${appellantCaseUrl}/enforcement-effective-date/change`)
					.send(invalidData);
				expect(response.statusCode).toBe(400);

				const elementInnerHtml = parseHtml(response.text).innerHTML;

				expect(elementInnerHtml).toContain(`${legendText}</h1>`);
				expect(elementInnerHtml).toContain(`For example, ${getExampleDateHint(27)}</div>`);

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
				{ value: '', expectedError: 'The effective date must include a month' },
				{
					value: 'a',
					expectedError: 'The effective date must be a real date'
				},
				{ value: '0', expectedError: 'The effective date month must be between 1 and 12' },
				{ value: '13', expectedError: 'The effective date month must be between 1 and 12' }
			];

			for (const testCase of testCases) {
				const invalidData = {
					'enforcement-effective-date-day': '1',
					'enforcement-effective-date-month': testCase.value,
					'enforcement-effective-date-year': '2021'
				};
				nock('http://test/')
					.get(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
					.reply(200, appellantCaseDataNotValidated);

				const response = await request
					.post(`${appellantCaseUrl}/enforcement-effective-date/change`)
					.send(invalidData);
				expect(response.statusCode).toBe(400);

				const elementInnerHtml = parseHtml(response.text).innerHTML;

				expect(elementInnerHtml).toContain(`${legendText}</h1>`);
				expect(elementInnerHtml).toContain(`For example, ${getExampleDateHint(27)}</div>`);

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
				{ value: '', expectedError: 'The effective date must include a year' },
				{ value: 'a', expectedError: 'The effective date year must be a number' },
				{ value: '202', expectedError: 'The effective date year must be 4 digits' }
			];

			for (const testCase of testCases) {
				const invalidData = {
					'enforcement-effective-date-day': '1',
					'enforcement-effective-date-month': 'Jul',
					'enforcement-effective-date-year': testCase.value
				};
				nock('http://test/')
					.get(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
					.reply(200, appellantCaseDataNotValidated);

				const response = await request
					.post(`${appellantCaseUrl}/enforcement-effective-date/change`)
					.send(invalidData);
				expect(response.statusCode).toBe(400);

				const elementInnerHtml = parseHtml(response.text).innerHTML;

				expect(elementInnerHtml).toContain(`${legendText}</h1>`);
				expect(elementInnerHtml).toContain(`For example, ${getExampleDateHint(27)}</div>`);

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
