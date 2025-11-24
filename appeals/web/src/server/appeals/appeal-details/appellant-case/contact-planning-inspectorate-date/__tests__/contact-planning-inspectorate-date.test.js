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
const legendText = 'When did you contact the Planning Inspectorate?';
const dateName = 'date you contacted the Planning Inspectorate';

describe('contact-planning-inspectorate-date', () => {
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('GET /change', () => {
		it('should render the contactPlanningInspectorateDate change page', async () => {
			nock('http://test/')
				.get(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
				.reply(200, appellantCaseDataNotValidated);
			const response = await request.get(
				`${appellantCaseUrl}/contact-planning-inspectorate-date/change`
			);

			const elementInnerHtml = parseHtml(response.text).innerHTML;

			expect(elementInnerHtml).toMatchSnapshot();
			expect(elementInnerHtml).toContain(`${legendText}</h1>`);
		});
	});

	describe('POST /change', () => {
		it('should re-direct to appellant-case if date is valid', async () => {
			const validData = {
				'contact-planning-inspectorate-date-day': '11',
				'contact-planning-inspectorate-date-month': 'July',
				'contact-planning-inspectorate-date-year': '2021'
			};

			nock('http://test/')
				.patch(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
				.reply(200, validData);

			const response = await request
				.post(`${appellantCaseUrl}/contact-planning-inspectorate-date/change`)
				.send(validData);

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/appellant-case'
			);
		});

		it('should re-render application submission date change page if day is not valid', async () => {
			const testCases = [
				{
					value: '',
					expectedError: `The ${dateName} must include a day`
				},
				{
					value: 'a',
					expectedError: `The ${dateName} day must be a number`
				},
				{
					value: '0',
					expectedError: `The ${dateName} day must be between 1 and 31`
				},
				{
					value: '32',
					expectedError: `The ${dateName} day must be between 1 and 31`
				}
			];

			for (const testCase of testCases) {
				const invalidData = {
					'contact-planning-inspectorate-date-day': testCase.value,
					'contact-planning-inspectorate-date-month': '06',
					'contact-planning-inspectorate-date-year': '2021'
				};
				nock('http://test/')
					.get(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
					.reply(200, appellantCaseDataNotValidated);

				const response = await request
					.post(`${appellantCaseUrl}/contact-planning-inspectorate-date/change`)
					.send(invalidData);
				expect(response.statusCode).toBe(400);

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
				{
					value: '',
					expectedError: `The ${dateName} must include a month`
				},
				{
					value: 'a',
					expectedError: `The ${dateName} must be a real date`
				},
				{
					value: '0',
					expectedError: `The ${dateName} month must be between 1 and 12`
				},
				{
					value: '13',
					expectedError: `The ${dateName} month must be between 1 and 12`
				}
			];

			for (const testCase of testCases) {
				const invalidData = {
					'contact-planning-inspectorate-date-day': '1',
					'contact-planning-inspectorate-date-month': testCase.value,
					'contact-planning-inspectorate-date-year': '2021'
				};
				nock('http://test/')
					.get(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
					.reply(200, appellantCaseDataNotValidated);

				const response = await request
					.post(`${appellantCaseUrl}/contact-planning-inspectorate-date/change`)
					.send(invalidData);
				expect(response.statusCode).toBe(400);

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
				{
					value: '',
					expectedError: `The ${dateName} must include a year`
				},
				{
					value: 'a',
					expectedError: `The ${dateName} year must be a number`
				},
				{
					value: '202',
					expectedError: `The ${dateName} year must be 4 digits`
				},
				{
					value: '3000',
					expectedError: `The ${dateName} must be today or in the past`
				}
			];

			for (const testCase of testCases) {
				const invalidData = {
					'contact-planning-inspectorate-date-day': '1',
					'contact-planning-inspectorate-date-month': 'Jul',
					'contact-planning-inspectorate-date-year': testCase.value
				};
				nock('http://test/')
					.get(`/appeals/${appealId}/appellant-cases/${appellantCaseId}`)
					.reply(200, appellantCaseDataNotValidated);

				const response = await request
					.post(`${appellantCaseUrl}/contact-planning-inspectorate-date/change`)
					.send(invalidData);
				expect(response.statusCode).toBe(400);

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
