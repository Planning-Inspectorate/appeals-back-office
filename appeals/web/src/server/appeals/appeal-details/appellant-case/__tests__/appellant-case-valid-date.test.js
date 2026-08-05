import { appealData, appellantCaseDataValidOutcome } from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { jest } from '@jest/globals';
import { parseHtml } from '@pins/platform';

import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';
const appellantCasePagePath = '/appellant-case';
const validOutcomePagePath = '/valid';
const validDatePagePath = '/date';

describe('appellant-case valid', () => {
	afterAll(() => {
		nock.cleanAll();
		nock.restore();
		jest.clearAllMocks();
	});
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('GET /appellant-case/valid/date', () => {
		it('should render the valid due date page prefilled with the case created date', async () => {
			const response = await request.get(
				`${baseUrl}/1${appellantCasePagePath}${validOutcomePagePath}${validDatePagePath}`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Enter valid date for case</h1>');
			expect(unprettifiedElement.innerHTML).toContain(
				'This is the date all case documentation was received and the appeal was valid.</p>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="valid-date-day" type="text" value="21" inputmode="numeric">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="valid-date-month" type="text" value="5" inputmode="numeric">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="valid-date-year" type="text" value="2023" inputmode="numeric">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'Confirming will inform the relevant parties of the valid date</div>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Confirm</button>');
		});
	});

	describe('POST /appellant-case/valid/date', () => {
		beforeEach(async () => {
			nock.cleanAll();
			nock('http://test/')
				.get(`/appeals/${appealData.appealId}?include=appellantCase,appealType`)
				.reply(200, appealData)
				.persist();
			nock('http://test/').patch(`/appeals/${appealData.appealId}`).reply(200);
			nock('http://test/')
				.patch('/appeals/1/appellant-cases/0')
				.reply(200, { validationOutcome: 'valid' });
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataValidOutcome)
				.persist();

			await request.post(`${baseUrl}/1${appellantCasePagePath}`).send({
				reviewOutcome: 'valid'
			});
		});

		afterEach(() => {
			nock.cleanAll();
		});

		it('should re-render the valid date page with the expected error message if no date was provided', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${validOutcomePagePath}${validDatePagePath}`)
				.send({
					'valid-date-day': '',
					'valid-date-month': '',
					'valid-date-year': ''
				});

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Enter valid date for case</h1>');

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain('Enter the valid date');
		});

		it('should re-render the valid date page with the expected error message if provided date is not in the past', async () => {
			const testCases = [
				{
					description: 'month as number',
					payload: {
						'valid-date-day': '1',
						'valid-date-month': '1',
						'valid-date-year': '3000'
					}
				},
				{
					description: 'month as full name',
					payload: {
						'valid-date-day': '1',
						'valid-date-month': 'January',
						'valid-date-year': '3000'
					}
				},
				{
					description: 'month as abbreviation',
					payload: {
						'valid-date-day': '1',
						'valid-date-month': 'Jan',
						'valid-date-year': '3000'
					}
				}
			];

			for (const testCase of testCases) {
				const response = await request
					.post(`${baseUrl}/1${appellantCasePagePath}${validOutcomePagePath}${validDatePagePath}`)
					.send(testCase.payload);

				expect(response.statusCode).toBe(200);

				const element = parseHtml(response.text);
				expect(element.innerHTML).toMatchSnapshot(testCase.description);
				expect(element.innerHTML).toContain('Enter valid date for case</h1>');

				const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
					rootElement: '.govuk-error-summary',
					skipPrettyPrint: true
				}).innerHTML;

				expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
				expect(unprettifiedErrorSummaryHtml).toContain(
					'The valid date must be today or in the past</a>'
				);
			}
		});

		it('should re-render the valid date page with the expected error message if an invalid day was provided', async () => {
			let response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${validOutcomePagePath}${validDatePagePath}`)
				.send({
					'valid-date-day': '0',
					'valid-date-month': '1',
					'valid-date-year': '3000'
				});

			expect(response.statusCode).toBe(200);
			let element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('class="govuk-error-summary"');
			expect(element.innerHTML).toContain('There is a problem</h2>');
			expect(element.innerHTML).toContain('Valid date day must be between 1 and 31</a>');

			response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${validOutcomePagePath}${validDatePagePath}`)
				.send({
					'valid-date-day': '32',
					'valid-date-month': '1',
					'valid-date-year': '3000'
				});

			expect(response.statusCode).toBe(200);
			element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('class="govuk-error-summary"');
			expect(element.innerHTML).toContain('There is a problem</h2>');
			expect(element.innerHTML).toContain('Valid date day must be between 1 and 31</a>');

			response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${validOutcomePagePath}${validDatePagePath}`)
				.send({
					'valid-date-day': 'first',
					'valid-date-month': '1',
					'valid-date-year': '3000'
				});

			expect(response.statusCode).toBe(200);

			element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Enter valid date for case</h1>');

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain('Valid date day must be a number</a>');
		});

		describe('should re-render the update date page with the expected error message if an invalid month was provided', () => {
			const testCases = [
				{
					day: '1',
					month: '0',
					year: '3000',
					description: 'month "0"',
					expectedErrorMessageHtml: 'Valid date month must be between 1 and 12</a>'
				},
				{
					day: '1',
					month: '13',
					year: '3000',
					description: 'month "13"',
					expectedErrorMessageHtml: 'Valid date month must be between 1 and 12</a>'
				},
				{
					day: '1',
					month: 'descend',
					year: '3000',
					description: 'month "descend"',
					expectedErrorMessageHtml: 'Valid date must be a real date</a>'
				}
			];
			testCases.forEach(({ day, month, year, description, expectedErrorMessageHtml }) => {
				it(`should re-render the update date page with the expected error message if an invalid ${description} was provided`, async () => {
					const response = await request
						.post(`${baseUrl}/1${appellantCasePagePath}${validOutcomePagePath}${validDatePagePath}`)
						.send({
							'valid-date-day': day,
							'valid-date-month': month,
							'valid-date-year': year
						});

					expect(response.statusCode).toBe(200);
					const element = parseHtml(response.text);
					expect(element.innerHTML).toMatchSnapshot();

					const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
						rootElement: '.govuk-error-summary',
						skipPrettyPrint: true
					}).innerHTML;

					expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
					expect(unprettifiedErrorSummaryHtml).toContain(expectedErrorMessageHtml);
				});
			});
		});

		it('should re-render the valid date page with the expected error message if an invalid year "23" was provided', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${validOutcomePagePath}${validDatePagePath}`)
				.send({
					'valid-date-day': '1',
					'valid-date-month': '1',
					'valid-date-year': '23'
				});

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Enter valid date for case</h1>');

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain('Valid date year must be 4 digits</a>');
		});

		it('should re-render the valid date page with the expected error message if an invalid year "abc" was provided', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${validOutcomePagePath}${validDatePagePath}`)
				.send({
					'valid-date-day': '1',
					'valid-date-month': '1',
					'valid-date-year': 'abc'
				});

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Enter valid date for case</h1>');

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain('Valid date year must be a number</a>');
		});

		it('should re-render the valid date page with the expected error message if an invalid date was provided', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${validOutcomePagePath}${validDatePagePath}`)
				.send({
					'valid-date-day': '29',
					'valid-date-month': '2',
					'valid-date-year': '3000'
				});

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Enter valid date for case</h1>');

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain('Valid date must be a real date</a>');
		});

		it('should re-render the valid date page with the expected error message if date was in past but prior to the date the case was received', async () => {
			const cases = [
				{ description: 'numeric month', value: '1' },
				{ description: 'full month name', value: 'January' },
				{ description: 'abbreviated month name', value: 'Jan' }
			];

			for (const caseItem of cases) {
				const response = await request
					.post(`${baseUrl}/1${appellantCasePagePath}${validOutcomePagePath}${validDatePagePath}`)
					.send({
						'valid-date-day': '1',
						'valid-date-month': caseItem.value,
						'valid-date-year': '2023'
					});

				expect(response.statusCode).toBe(200);

				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot(caseItem.description);
				expect(element.innerHTML).toContain('Enter valid date for case</h1>');

				const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
					rootElement: '.govuk-error-summary',
					skipPrettyPrint: true
				}).innerHTML;

				expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
				expect(unprettifiedErrorSummaryHtml).toContain(
					'The valid date must be on or after the date the case was received.</a>'
				);
			}
		});

		it('should redirect to the case details page if a valid date was provided', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${validOutcomePagePath}${validDatePagePath}`)
				.send({
					'valid-date-day': '22',
					'valid-date-month': '5',
					'valid-date-year': '2023'
				});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe('Found. Redirecting to /appeals-service/appeal-details/1');
		});
	});
});
