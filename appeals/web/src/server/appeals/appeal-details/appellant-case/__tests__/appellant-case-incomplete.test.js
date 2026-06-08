import { textInputCharacterLimits } from '#appeals/appeal.constants.js';
import {
	calculateIncompleteDueDate,
	dateISOStringToDayMonthYearHourMinute,
	oneMonthBefore
} from '#lib/dates.js';
import {
	appealData,
	appealDataCasAdvert,
	appealDataCasPlanning,
	appellantCaseDataNotValidated,
	appellantCaseIncompleteReasons
} from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { jest } from '@jest/globals';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';
const appellantCasePagePath = '/appellant-case';
const incompleteOutcomePagePath = '/incomplete';
const updateDueDatePagePath = '/date';
const incompleteReasonsWithoutText = appellantCaseIncompleteReasons.filter(
	(reason) => reason.hasText === false
);
const incompleteReasonsWithText = appellantCaseIncompleteReasons.filter(
	(reason) => reason.hasText === true
);

const incompleteReasonsWithoutTextIds = incompleteReasonsWithoutText.map((reason) => reason.id);
const incompleteReasonsWithTextIds = incompleteReasonsWithText.map((reason) => reason.id);

describe('appellant-case incomplete', () => {
	afterAll(() => {
		nock.cleanAll();
		nock.restore();
		jest.clearAllMocks();
	});
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('GET /appellant-case/incomplete', () => {
		const expeditedAppealTypes = [
			['HAS', appealData],
			['CAS advertisement', appealDataCasAdvert],
			['CAS planning', appealDataCasPlanning]
		];

		beforeEach(() => {
			nock('http://test/')
				.get('/appeals/appellant-case-incomplete-reasons')
				.reply(200, appellantCaseIncompleteReasons);
		});

		afterEach(() => {
			nock.cleanAll();
		});

		it.each(expeditedAppealTypes)(
			'should render the incomplete reason page and content for a %s case submitted from 1st April 2026 onwards',
			async (_, testAppealData) => {
				nock('http://test/').get('/appeals/1?include=all').reply(200, {
					testAppealData,
					appealId: 1
				});
				nock('http://test/')
					.get('/appeals/1/appellant-cases/0')
					.reply(200, {
						...appellantCaseDataNotValidated,
						applicationDate: '2026-04-01T00:00:00.000Z'
					});

				const response = await request.get(
					`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();
				expect(element.innerHTML).toContain('Why is the appeal incomplete?</h1>');
				expect(element.innerHTML).toContain('data-module="govuk-checkboxes">');

				// Checkbox content check
				if (!element.textContent) {
					throw new Error('Test setup failed: The main element was not found in the HTML');
				}
				const textContent = element.textContent.replace(/\s+/g, ' ').trim();
				expect(textContent).toContain(
					'Appellant name is not the same on the application form and appeal form'
				);
				expect(textContent).not.toContain(
					'Attachments and/or appendices have not been included to the full statement of case'
				);
				expect(textContent).toContain("LPA's decision notice is missing");
				expect(textContent).toContain("LPA's decision notice is incorrect or incomplete");
				expect(textContent).toContain(
					'Documents and/or plans referred in the application form, decision notice and appeal covering letter are missing'
				);
				expect(textContent).toContain(
					'Agricultural holding certificate and declaration have not been completed on the appeal form'
				);
				expect(textContent).toContain('The original application form is missing');
				expect(textContent).toContain('The original application form is incomplete');
				expect(textContent).not.toContain('Statement of case and ground of appeal are missing');
				expect(textContent).toContain('Draft statement of common ground is missing');
				expect(textContent).toContain('Other');

				expect(element.innerHTML).toContain('Continue</button>');
			}
		);

		it.each(expeditedAppealTypes)(
			'should render the incomplete reason page and content for a %s case submitted before 1st April 2026',
			async (_, testAppealData) => {
				nock('http://test/').get('/appeals/1?include=all').reply(200, {
					testAppealData,
					appealId: 1
				});
				nock('http://test/')
					.get('/appeals/1/appellant-cases/0')
					.reply(200, {
						...appellantCaseDataNotValidated,
						applicationDate: '2026-03-02T00:00:00.000Z'
					});

				const response = await request.get(
					`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();
				expect(element.innerHTML).toContain('Why is the appeal incomplete?</h1>');
				expect(element.innerHTML).toContain('data-module="govuk-checkboxes">');

				// Checkbox content check
				if (!element.textContent) {
					throw new Error('Test setup failed: The main element was not found in the HTML');
				}
				const textContent = element.textContent.replace(/\s+/g, ' ').trim();
				expect(textContent).toContain(
					'Appellant name is not the same on the application form and appeal form'
				);
				expect(textContent).toContain(
					'Attachments and/or appendices have not been included to the full statement of case'
				);
				expect(textContent).toContain("LPA's decision notice is missing");
				expect(textContent).toContain("LPA's decision notice is incorrect or incomplete");
				expect(textContent).toContain(
					'Documents and/or plans referred in the application form, decision notice and appeal covering letter are missing'
				);
				expect(textContent).toContain(
					'Agricultural holding certificate and declaration have not been completed on the appeal form'
				);
				expect(textContent).toContain('The original application form is missing');
				expect(textContent).toContain('The original application form is incomplete');
				expect(textContent).toContain('Statement of case and ground of appeal are missing');
				expect(textContent).toContain('Draft statement of common ground is missing');
				expect(textContent).toContain('Other');

				expect(element.innerHTML).toContain('Continue</button>');
			}
		);
	});

	describe('POST /appellant-case/incomplete', () => {
		beforeEach(async () => {
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataNotValidated);
			nock('http://test/')
				.get('/appeals/appellant-case-incomplete-reasons')
				.reply(200, appellantCaseIncompleteReasons);
		});

		afterEach(() => {
			nock.cleanAll();
		});

		it('should re-render the incomplete reason page with the expected error message if no incomplete reason was provided', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}`)
				.send({});

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;
			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain('Select why the appeal is incomplete</a>');
		});

		it('should re-render the incomplete reason page with the expected error message if a single incomplete reason with text was provided but the matching text property is an empty string', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}`)
				.send({
					incompleteReason: incompleteReasonsWithTextIds[0],
					[`incompleteReason-${incompleteReasonsWithTextIds[0]}`]: ''
				});

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;
			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain('Enter a reason</a>');
		});

		it('should re-render the incomplete reason page with the expected error message if a single incomplete reason with text was provided but the matching text property is an empty array', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}`)
				.send({
					incompleteReason: incompleteReasonsWithTextIds[0],
					[`incompleteReason-${incompleteReasonsWithTextIds[0]}`]: []
				});

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;
			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain('Enter a reason</a>');
		});

		it('should re-render the incomplete reason page with the expected error message if multiple incomplete reasons with text were provided but any of the matching text properties are empty strings', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}`)
				.send({
					incompleteReason: [incompleteReasonsWithTextIds[0], incompleteReasonsWithTextIds[1]],
					[`incompleteReason-${incompleteReasonsWithTextIds[0]}`]: 'test reason text 1',
					[`incompleteReason-${incompleteReasonsWithTextIds[0]}`]: ''
				});

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;
			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain('Enter a reason</a>');
		});

		it('should re-render the incomplete reason page with the expected error message if multiple incomplete reasons with text were provided but any of the matching text properties are empty arrays', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}`)
				.send({
					incompleteReason: [incompleteReasonsWithTextIds[0], incompleteReasonsWithTextIds[1]],
					[`incompleteReason-${incompleteReasonsWithTextIds[0]}`]: 'test reason text 1',
					[`incompleteReason-${incompleteReasonsWithTextIds[0]}`]: []
				});

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;
			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain('Enter a reason</a>');
		});

		it('should re-render the incomplete reason page with the expected error message if a single incomplete reason with text was provided but the matching text property exceeds the character limit', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}`)
				.send({
					incompleteReason: incompleteReasonsWithTextIds[0],
					[`incompleteReason-${incompleteReasonsWithTextIds[0]}`]: 'a'.repeat(
						textInputCharacterLimits.checkboxTextItemsLength + 1
					)
				});

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;
			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain(
				`Reason must be ${textInputCharacterLimits.checkboxTextItemsLength} characters or less</a>`
			);
		});

		it('should re-render the incomplete reason page with the expected error message if multiple incomplete reasons with text were provided but any of the matching text properties exceed the character limit', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}`)
				.send({
					incompleteReason: [incompleteReasonsWithTextIds[0], incompleteReasonsWithTextIds[1]],
					[`incompleteReason-${incompleteReasonsWithTextIds[0]}`]: 'test reason text 1',
					[`incompleteReason-${incompleteReasonsWithTextIds[0]}`]: 'a'.repeat(
						textInputCharacterLimits.checkboxTextItemsLength + 1
					)
				});

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;
			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain(
				`Reason must be ${textInputCharacterLimits.checkboxTextItemsLength} characters or less</a>`
			);
		});

		it('should redirect to the update due date page if a single incomplete reason without text was provided', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}`)
				.send({
					incompleteReason: incompleteReasonsWithoutTextIds[0]
				});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/appellant-case/incomplete/date'
			);
		});

		it('should redirect to the update due date page a single incomplete reason with text within the character limit was provided', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}`)
				.send({
					incompleteReason: incompleteReasonsWithTextIds[0],
					[`incompleteReason-${incompleteReasonsWithTextIds[0]}`]: [
						'a'.repeat(textInputCharacterLimits.defaultInputLength),
						'a'.repeat(textInputCharacterLimits.defaultInputLength)
					]
				});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/appellant-case/incomplete/date'
			);
		});

		it('should redirect to the update due date page if multiple incomplete reasons without text were provided', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}`)
				.send({
					incompleteReason: incompleteReasonsWithoutTextIds
				});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/appellant-case/incomplete/date'
			);
		});

		it('should redirect to the update due date page if multiple incomplete reasons with text within the character limit were provided', async () => {
			const response = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}`)
				.send({
					incompleteReason: [incompleteReasonsWithTextIds[0], incompleteReasonsWithTextIds[1]],
					[`incompleteReason-${incompleteReasonsWithTextIds[0]}`]: [
						'a'.repeat(textInputCharacterLimits.defaultInputLength)
					],
					[`incompleteReason-${incompleteReasonsWithTextIds[1]}`]: [
						'a'.repeat(textInputCharacterLimits.defaultInputLength),
						'test reason text 3'
					]
				});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/appellant-case/incomplete/date'
			);
		});
	});

	describe('GET /appellant-case/incomplete/date', () => {
		beforeEach(() => {
			jest.spyOn(Date, 'now').mockReturnValue(1735732800000); // set date for Hint text

			nock('http://test/')
				.get(`/appeals/1?include=all`)
				.reply(200, {
					...appealData,
					appealId: 1
				});
		});

		afterEach(() => {
			jest.restoreAllMocks();
			nock.cleanAll();
		});

		it('should render the update due date page without pre-populated date values if there is no existing due date and applicationDecisionDate is not set', async () => {
			nock('http://test/')
				.get('/appeals/2?include=all')
				.reply(200, {
					...appealData,
					appealId: 2,
					documentationSummary: {
						...appealData.documentationSummary,
						appellantCase: {
							...appealData.documentationSummary.appellantCase,
							dueDate: null
						}
					}
				})
				.persist();
			nock('http://test/')
				.get('/appeals/2/appellant-cases/0')
				.reply(200, appellantCaseDataNotValidated);

			const response = await request.get(
				`${baseUrl}/2${appellantCasePagePath}${incompleteOutcomePagePath}${updateDueDatePagePath}`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'name="due-date-day" type="text" inputmode="numeric">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="due-date-month" type="text" inputmode="numeric">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="due-date-year" type="text" inputmode="numeric">'
			);
			expect(unprettifiedElement.innerHTML).not.toContain(
				'name="due-date-day" type="text" value="'
			);
			expect(unprettifiedElement.innerHTML).not.toContain(
				'name="due-date-month" type="text" value="'
			);
			expect(unprettifiedElement.innerHTML).not.toContain(
				'name="due-date-year" type="text" value="'
			);
		});

		it('should render the update due date page with pre-populated date values if there is no existing due date and applicationDecisionDate is set', async () => {
			const decisionDate = oneMonthBefore(new Date()).toISOString();
			const expectedDate = calculateIncompleteDueDate(decisionDate, 'Planning appeal');
			const expectedValues = dateISOStringToDayMonthYearHourMinute(expectedDate?.toISOString());

			nock('http://test/')
				.get('/appeals/2?include=all')
				.reply(200, {
					...appealData,
					appealId: 2,
					appealType: 'Planning appeal',
					documentationSummary: {
						...appealData.documentationSummary,
						appellantCase: {
							...appealData.documentationSummary.appellantCase,
							dueDate: null
						}
					}
				})
				.persist();

			nock('http://test/')
				.get('/appeals/2/appellant-cases/0')
				.reply(200, {
					...appellantCaseDataNotValidated,
					applicationDecisionDate: decisionDate
				});

			const response = await request.get(
				`${baseUrl}/2${appellantCasePagePath}${incompleteOutcomePagePath}${updateDueDatePagePath}`
			);

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				`name="due-date-day" type="text" value="${expectedValues.day}" inputmode="numeric">`
			);
			expect(unprettifiedElement.innerHTML).toContain(
				`name="due-date-month" type="text" value="${expectedValues.month}" inputmode="numeric">`
			);
			expect(unprettifiedElement.innerHTML).toContain(
				`name="due-date-year" type="text" value="${expectedValues.year}" inputmode="numeric">`
			);
		});

		it('should render the update due date page with correct pre-populated date values if there is an existing due date', async () => {
			nock('http://test/')
				.get('/appeals/2?include=all')
				.reply(200, {
					...appealData,
					appealId: 2,
					documentationSummary: {
						...appealData.documentationSummary,
						appellantCase: {
							...appealData.documentationSummary.appellantCase,
							dueDate: '2024-10-02T10:27:06.626Z'
						}
					}
				})
				.persist();
			nock('http://test/')
				.get('/appeals/2/appellant-cases/0')
				.reply(200, appellantCaseDataNotValidated);

			const response = await request.get(
				`${baseUrl}/2${appellantCasePagePath}${incompleteOutcomePagePath}${updateDueDatePagePath}`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('name="due-date-day" type="text" value="2"');
			expect(unprettifiedElement.innerHTML).toContain(
				'name="due-date-month" type="text" value="10"'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="due-date-year" type="text" value="2024"'
			);
		});
	});

	describe('POST /appellant-case/incomplete/date', () => {
		beforeEach(async () => {
			jest.spyOn(Date, 'now').mockReturnValue(1735732800000); // set date for Hint text

			nock('http://test/')
				.get(`/appeals/1`)
				.reply(200, {
					...appealData,
					appealId: 1
				});
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataNotValidated);
		});

		afterEach(() => {
			jest.restoreAllMocks();
			nock.cleanAll();
		});

		it('should render a 500 error page if required data is not present in the session', async () => {
			const response = await request
				.post(
					`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}${updateDueDatePagePath}`
				)
				.send({
					'due-date-day': '',
					'due-date-month': '',
					'due-date-year': ''
				});

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Sorry, there is a problem with the service</h1>');
		});

		it('should re-render the update date page with the expected error message if no date was provided', async () => {
			// post to incomplete reason page controller is necessary to set required data in the session
			const incompleteReasonPostResponse = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}`)
				.send({
					incompleteReason: [incompleteReasonsWithTextIds[0], incompleteReasonsWithTextIds[1]],
					[`incompleteReason-${incompleteReasonsWithTextIds[0]}`]: [
						'test reason text 1',
						'test reason text 2'
					],
					[`incompleteReason-${incompleteReasonsWithTextIds[1]}`]: 'test reason text 1'
				});

			expect(incompleteReasonPostResponse.statusCode).toBe(302);

			const response = await request
				.post(
					`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}${updateDueDatePagePath}`
				)
				.send({
					'due-date-day': '',
					'due-date-month': '',
					'due-date-year': ''
				});

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;
			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain('Enter the appeal due date');
		});

		it('should re-render the update date page with the expected error message if provided date is not in the future', async () => {
			// post to incomplete reason page controller is necessary to set required data in the session
			const incompleteReasonPostResponse = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}`)
				.send({
					incompleteReason: [incompleteReasonsWithTextIds[0], incompleteReasonsWithTextIds[1]],
					[`incompleteReason-${incompleteReasonsWithTextIds[0]}`]: [
						'test reason text 1',
						'test reason text 2'
					],
					[`incompleteReason-${incompleteReasonsWithTextIds[1]}`]: 'test reason text 1'
				});

			expect(incompleteReasonPostResponse.statusCode).toBe(302);

			const monthVariants = [
				{ description: 'numeric month', value: '1' },
				{ description: 'full month name', value: 'January' },
				{ description: 'abbreviated month name', value: 'Jan' }
			];

			for (const variant of monthVariants) {
				const response = await request
					.post(
						`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}${updateDueDatePagePath}`
					)
					.send({
						'due-date-day': '1',
						'due-date-month': variant.value,
						'due-date-year': '2000'
					});

				const element = parseHtml(response.text);
				expect(element.innerHTML).toMatchSnapshot(variant.description);

				const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
					rootElement: '.govuk-error-summary',
					skipPrettyPrint: true
				}).innerHTML;

				expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
				expect(unprettifiedErrorSummaryHtml).toContain(
					'The appeal due date must be in the future</a>'
				);
			}
		});

		it('should re-render the update date page with the expected error message if an invalid day was provided', async () => {
			// post to incomplete reason page controller is necessary to set required data in the session
			const incompleteReasonPostResponse = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}`)
				.send({
					incompleteReason: [incompleteReasonsWithTextIds[0], incompleteReasonsWithTextIds[1]],
					[`incompleteReason-${incompleteReasonsWithTextIds[0]}`]: [
						'test reason text 1',
						'test reason text 2'
					],
					[`incompleteReason-${incompleteReasonsWithTextIds[1]}`]: 'test reason text 1'
				});

			expect(incompleteReasonPostResponse.statusCode).toBe(302);

			let response = await request
				.post(
					`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}${updateDueDatePagePath}`
				)
				.send({
					'due-date-day': '0',
					'due-date-month': '1',
					'due-date-year': '3000'
				});

			expect(response.statusCode).toBe(200);

			let element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('class="govuk-error-summary"');
			expect(element.innerHTML).toContain('There is a problem</h2>');
			expect(element.innerHTML).toContain('The appeal due date day must be between 1 and 31</a>');

			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataNotValidated);

			response = await request
				.post(
					`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}${updateDueDatePagePath}`
				)
				.send({
					'due-date-day': '32',
					'due-date-month': '1',
					'due-date-year': '3000'
				});

			expect(response.statusCode).toBe(200);

			element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('class="govuk-error-summary"');
			expect(element.innerHTML).toContain('There is a problem</h2>');
			expect(element.innerHTML).toContain('The appeal due date day must be between 1 and 31</a>');

			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataNotValidated);

			response = await request
				.post(
					`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}${updateDueDatePagePath}`
				)
				.send({
					'due-date-day': 'first',
					'due-date-month': '1',
					'due-date-year': '3000'
				});

			expect(response.statusCode).toBe(200);

			element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;
			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain(
				'The appeal due date day must be a number</a>'
			);
		});

		it('should re-render the update date page with the expected error message if an invalid month was provided', async () => {
			// post to incomplete reason page controller is necessary to set required data in the session
			const incompleteReasonPostResponse = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}`)
				.send({
					incompleteReason: [incompleteReasonsWithTextIds[0], incompleteReasonsWithTextIds[1]],
					[`incompleteReason-${incompleteReasonsWithTextIds[0]}`]: [
						'test reason text 1',
						'test reason text 2'
					],
					[`incompleteReason-${incompleteReasonsWithTextIds[1]}`]: 'test reason text 1'
				});

			expect(incompleteReasonPostResponse.statusCode).toBe(302);

			let response = await request
				.post(
					`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}${updateDueDatePagePath}`
				)
				.send({
					'due-date-day': '1',
					'due-date-month': '0',
					'due-date-year': '3000'
				});

			expect(response.statusCode).toBe(200);

			let element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('class="govuk-error-summary"');
			expect(element.innerHTML).toContain('There is a problem</h2>');
			expect(element.innerHTML).toContain('The appeal due date month must be between 1 and 12</a>');

			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataNotValidated);

			response = await request
				.post(
					`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}${updateDueDatePagePath}`
				)
				.send({
					'due-date-day': '1',
					'due-date-month': '13',
					'due-date-year': '3000'
				});

			expect(response.statusCode).toBe(200);

			element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('class="govuk-error-summary"');
			expect(element.innerHTML).toContain('There is a problem</h2>');
			expect(element.innerHTML).toContain('The appeal due date month must be between 1 and 12</a>');

			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataNotValidated);

			response = await request
				.post(
					`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}${updateDueDatePagePath}`
				)
				.send({
					'due-date-day': '1',
					'due-date-month': 'decend',
					'due-date-year': '3000'
				});

			expect(response.statusCode).toBe(200);

			element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;
			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain('The appeal due date must be a real date</a>');
		});

		it('should re-render the update date page with the expected error message if an invalid year was provided', async () => {
			// post to incomplete reason page controller is necessary to set required data in the session
			const incompleteReasonPostResponse = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}`)
				.send({
					incompleteReason: [incompleteReasonsWithTextIds[0], incompleteReasonsWithTextIds[1]],
					[`incompleteReason-${incompleteReasonsWithTextIds[0]}`]: [
						'test reason text 1',
						'test reason text 2'
					],
					[`incompleteReason-${incompleteReasonsWithTextIds[1]}`]: 'test reason text 1'
				});

			expect(incompleteReasonPostResponse.statusCode).toBe(302);

			let response = await request
				.post(
					`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}${updateDueDatePagePath}`
				)
				.send({
					'due-date-day': '1',
					'due-date-month': '1',
					'due-date-year': '23'
				});

			expect(response.statusCode).toBe(200);

			let element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('class="govuk-error-summary"');
			expect(element.innerHTML).toContain('There is a problem</h2>');
			expect(element.innerHTML).toContain('The appeal due date year must be 4 digits</a>');

			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, appellantCaseDataNotValidated);

			response = await request
				.post(
					`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}${updateDueDatePagePath}`
				)
				.send({
					'due-date-day': '1',
					'due-date-month': '1',
					'due-date-year': 'abc'
				});

			expect(response.statusCode).toBe(200);

			element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('class="govuk-error-summary"');
			expect(element.innerHTML).toContain('There is a problem</h2>');
			expect(element.innerHTML).toContain('The appeal due date year must be a number</a>');

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;
			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain(
				'The appeal due date year must be a number</a>'
			);
		});

		it('should re-render the update date page with the expected error message if an invalid date was provided', async () => {
			// post to incomplete reason page controller is necessary to set required data in the session
			const incompleteReasonPostResponse = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}`)
				.send({
					incompleteReason: [incompleteReasonsWithTextIds[0], incompleteReasonsWithTextIds[1]],
					[`incompleteReason-${incompleteReasonsWithTextIds[0]}`]: [
						'test reason text 1',
						'test reason text 2'
					],
					[`incompleteReason-${incompleteReasonsWithTextIds[1]}`]: 'test reason text 1'
				});

			expect(incompleteReasonPostResponse.statusCode).toBe(302);

			const response = await request
				.post(
					`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}${updateDueDatePagePath}`
				)
				.send({
					'due-date-day': '29',
					'due-date-month': '2',
					'due-date-year': '3000'
				});

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;
			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain('The appeal due date must be a real date</a>');
		});

		it('should redirect to the check and confirm page if a valid date was provided', async () => {
			// post to incomplete reason page controller is necessary to set required data in the session
			const incompleteReasonPostResponse = await request
				.post(`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}`)
				.send({
					incompleteReason: [incompleteReasonsWithTextIds[0], incompleteReasonsWithTextIds[1]],
					[`incompleteReason-${incompleteReasonsWithTextIds[0]}`]: [
						'test reason text 1',
						'test reason text 2'
					],
					[`incompleteReason-${incompleteReasonsWithTextIds[1]}`]: 'test reason text 1'
				});

			expect(incompleteReasonPostResponse.statusCode).toBe(302);

			const monthVariants = ['12', 'December', 'Dec'];
			for (const month of monthVariants) {
				nock('http://test/').post(`/appeals/validate-business-date`).reply(200, { result: true });

				const response = await request
					.post(
						`${baseUrl}/1${appellantCasePagePath}${incompleteOutcomePagePath}${updateDueDatePagePath}`
					)
					.send({
						'due-date-day': '2',
						'due-date-month': month,
						'due-date-year': '3000'
					});

				expect(response.statusCode).toBe(302);
				expect(response.text).toBe(
					'Found. Redirecting to /appeals-service/appeal-details/1/appellant-case/check-your-answers'
				);
			}
		});
	});
});
