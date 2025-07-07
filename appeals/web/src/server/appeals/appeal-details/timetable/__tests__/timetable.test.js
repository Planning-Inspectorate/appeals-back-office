import { jest } from '@jest/globals';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';
import { appealData as baseAppealData } from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';

const { app, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details/1/timetable';

describe('Timetable', () => {
	beforeEach(() => {
		//mocking the for example date for snapshots
		Date.now = jest.fn(() => new Date(Date.UTC(2024, 8, 14)).valueOf());
	});
	afterEach(teardown);

	describe('GET /edit', () => {
		it('should render "Timetable due dates" page for householder appeal type', async () => {
			const appealData = {
				...baseAppealData,
				appealTimetable: {
					appealTimetableId: 1
				}
			};

			nock('http://test/').get('/appeals/1').reply(200, appealData);
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, { planningObligation: { hasObligation: false } });

			const response = await request.get(`${baseUrl}/edit`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('LPA questionnaire due');
			expect(element.innerHTML).toContain('name="lpa-questionnaire-due-date-day');
			expect(element.innerHTML).toContain('name="lpa-questionnaire-due-date-month"');
			expect(element.innerHTML).toContain('name="lpa-questionnaire-due-date-year"');
			expect(element.innerHTML).toContain('Continue</button>');
		});

		it('should render correct "Timetable due dates" page for S78 appeal type and status lpa_questionnaire', async () => {
			const appealData = {
				...baseAppealData,
				appealTimetable: {
					appealTimetableId: 1
				}
			};
			appealData.appealType = 'Planning appeal';
			appealData.appealStatus = 'lpa_questionnaire';

			nock('http://test/').get('/appeals/1').reply(200, appealData);
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, { planningObligation: { hasObligation: false } });

			const response = await request.get(`${baseUrl}/edit`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Timetable due dates</h1>');
			expect(element.innerHTML).toContain('name="lpa-questionnaire-due-date-day');
			expect(element.innerHTML).toContain('name="lpa-questionnaire-due-date-month"');
			expect(element.innerHTML).toContain('name="lpa-questionnaire-due-date-year"');
			expect(element.innerHTML).toContain('name="lpa-statement-due-date-day');
			expect(element.innerHTML).toContain('name="lpa-statement-due-date-month"');
			expect(element.innerHTML).toContain('name="lpa-statement-due-date-year"');
			expect(element.innerHTML).toContain('name="ip-comments-due-date-day');
			expect(element.innerHTML).toContain('name="ip-comments-due-date-month"');
			expect(element.innerHTML).toContain('name="ip-comments-due-date-year"');
			expect(element.innerHTML).toContain('name="final-comments-due-date-day');
			expect(element.innerHTML).toContain('name="final-comments-due-date-month"');
			expect(element.innerHTML).toContain('name="final-comments-due-date-year"');
			expect(element.innerHTML).toContain('Continue</button>');
		});

		it('should render correct "Timetable due dates" page for S78 appeal type and status lpa_questionnaire and lpaq received', async () => {
			const appealData = {
				...baseAppealData,
				appealTimetable: {
					appealTimetableId: 1
				}
			};
			appealData.appealType = 'Planning appeal';
			appealData.appealStatus = 'lpa_questionnaire';
			appealData.documentationSummary = {
				lpaQuestionnaire: {
					status: 'received',
					dueDate: '2024-10-11T10:27:06.626Z',
					receivedAt: '2024-08-02T10:27:06.626Z',
					representationStatus: 'awaiting_review'
				}
			};

			nock('http://test/').get('/appeals/1').reply(200, appealData);
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, { planningObligation: { hasObligation: false } });

			const response = await request.get(`${baseUrl}/edit`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Timetable due dates</h1>');
			expect(element.innerHTML).toContain('name="lpa-statement-due-date-day');
			expect(element.innerHTML).toContain('name="lpa-statement-due-date-month"');
			expect(element.innerHTML).toContain('name="lpa-statement-due-date-year"');
			expect(element.innerHTML).toContain('name="ip-comments-due-date-day');
			expect(element.innerHTML).toContain('name="ip-comments-due-date-month"');
			expect(element.innerHTML).toContain('name="ip-comments-due-date-year"');
			expect(element.innerHTML).toContain('name="final-comments-due-date-day');
			expect(element.innerHTML).toContain('name="final-comments-due-date-month"');
			expect(element.innerHTML).toContain('name="final-comments-due-date-year"');
			expect(element.innerHTML).toContain('Continue</button>');
		});

		it('should render correct "Timetable due dates" page for S78 appeal type and status statements', async () => {
			const appealData = {
				...baseAppealData,
				appealTimetable: {
					appealTimetableId: 1
				}
			};
			appealData.appealType = 'Planning appeal';
			appealData.appealStatus = 'statements';

			nock('http://test/').get('/appeals/1').reply(200, appealData);
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, { planningObligation: { hasObligation: false } });

			const response = await request.get(`${baseUrl}/edit`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Timetable due dates</h1>');
			expect(element.innerHTML).toContain('name="lpa-statement-due-date-day');
			expect(element.innerHTML).toContain('name="lpa-statement-due-date-month"');
			expect(element.innerHTML).toContain('name="lpa-statement-due-date-year"');
			expect(element.innerHTML).toContain('name="ip-comments-due-date-day');
			expect(element.innerHTML).toContain('name="ip-comments-due-date-month"');
			expect(element.innerHTML).toContain('name="ip-comments-due-date-year"');
			expect(element.innerHTML).toContain('name="final-comments-due-date-day');
			expect(element.innerHTML).toContain('name="final-comments-due-date-month"');
			expect(element.innerHTML).toContain('name="final-comments-due-date-year"');
			expect(element.innerHTML).toContain('Continue</button>');
		});

		it('should render correct "Timetable due dates" page for S78 appeal type and status final_comments', async () => {
			const appealData = {
				...baseAppealData,
				appealTimetable: {
					appealTimetableId: 1
				}
			};
			appealData.appealType = 'Planning appeal';
			appealData.appealStatus = 'final_comments';

			nock('http://test/').get('/appeals/1').reply(200, appealData);
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, { planningObligation: { hasObligation: false } });

			const response = await request.get(`${baseUrl}/edit`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Final comments due');
			expect(element.innerHTML).toContain('name="final-comments-due-date-day');
			expect(element.innerHTML).toContain('name="final-comments-due-date-month"');
			expect(element.innerHTML).toContain('name="final-comments-due-date-year"');
			expect(element.innerHTML).toContain('Continue</button>');
		});

		it('should render correct "Timetable due dates" page for hearing appeal without planning obligation', async () => {
			const appealData = {
				...baseAppealData,
				appealStatus: 'lpa_questionnaire',
				appealTimetable: {
					appealTimetableId: 1
				},
				appealType: 'Planning appeal',
				documentationSummary: {
					lpaQuestionnaire: {
						status: 'received',
						dueDate: '2024-10-11T10:27:06.626Z',
						receivedAt: '2024-08-02T10:27:06.626Z',
						representationStatus: 'awaiting_review'
					}
				},
				procedureType: 'Hearing'
			};

			nock('http://test/').get('/appeals/1').reply(200, appealData);
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, { planningObligation: { hasObligation: false } });

			const response = await request.get(`${baseUrl}/edit`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('name="lpa-statement-due-date-day"');
			expect(element.innerHTML).toContain('name="lpa-statement-due-date-month"');
			expect(element.innerHTML).toContain('name="lpa-statement-due-date-year"');
			expect(element.innerHTML).toContain('name="ip-comments-due-date-day"');
			expect(element.innerHTML).toContain('name="ip-comments-due-date-month"');
			expect(element.innerHTML).toContain('name="ip-comments-due-date-year"');
			expect(element.innerHTML).toContain('name="statement-of-common-ground-due-date-day"');
			expect(element.innerHTML).toContain('name="statement-of-common-ground-due-date-month"');
			expect(element.innerHTML).toContain('name="statement-of-common-ground-due-date-year"');
			expect(element.innerHTML).toContain('Continue</button>');
		});

		it('should render correct "Timetable due dates" page for hearing appeal with planning obligation', async () => {
			const appealData = {
				...baseAppealData,
				appealStatus: 'lpa_questionnaire',
				appealTimetable: {
					appealTimetableId: 1
				},
				appealType: 'Planning appeal',
				documentationSummary: {
					lpaQuestionnaire: {
						status: 'received',
						dueDate: '2024-10-11T10:27:06.626Z',
						receivedAt: '2024-08-02T10:27:06.626Z',
						representationStatus: 'awaiting_review'
					}
				},
				procedureType: 'Hearing'
			};

			nock('http://test/').get('/appeals/1').reply(200, appealData);
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, { planningObligation: { hasObligation: true } });

			const response = await request.get(`${baseUrl}/edit`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('name="lpa-statement-due-date-day"');
			expect(element.innerHTML).toContain('name="lpa-statement-due-date-month"');
			expect(element.innerHTML).toContain('name="lpa-statement-due-date-year"');
			expect(element.innerHTML).toContain('name="ip-comments-due-date-day"');
			expect(element.innerHTML).toContain('name="ip-comments-due-date-month"');
			expect(element.innerHTML).toContain('name="ip-comments-due-date-year"');
			expect(element.innerHTML).toContain('name="statement-of-common-ground-due-date-day"');
			expect(element.innerHTML).toContain('name="statement-of-common-ground-due-date-month"');
			expect(element.innerHTML).toContain('name="statement-of-common-ground-due-date-year"');
			expect(element.innerHTML).toContain('name="planning-obligation-due-date-day"');
			expect(element.innerHTML).toContain('name="planning-obligation-due-date-month"');
			expect(element.innerHTML).toContain('name="planning-obligation-due-date-year"');
			expect(element.innerHTML).toContain('Continue</button>');
		});
	});

	describe('POST /edit', () => {
		describe('Householder', () => {
			const appealData = {
				...baseAppealData,
				appealTimetable: {
					appealTimetableId: 1
				}
			};

			beforeEach(() => {
				nock.cleanAll();
				nock('http://test/').get('/appeals/1').reply(200, appealData).persist();
				nock('http://test/')
					.get('/appeals/1/appellant-cases/0')
					.reply(200, { planningObligation: { hasObligation: false } })
					.persist();
				nock('http://test/').post(`/appeals/validate-business-date`).reply(200, { result: true });
			});
			afterEach(() => {
				nock.cleanAll();
			});

			it.each([
				{
					name: 'missing day',
					payload: {
						'lpa-questionnaire-due-date-month': '10',
						'lpa-questionnaire-due-date-year': '2050'
					},
					expectedError: 'LPA questionnaire due date must include a day</a>'
				},
				{
					name: 'missing month',
					payload: {
						'lpa-questionnaire-due-date-day': '10',
						'lpa-questionnaire-due-date-year': '2050'
					},
					expectedError: 'LPA questionnaire due date must include a month</a>'
				},
				{
					name: 'missing year',
					payload: {
						'lpa-questionnaire-due-date-day': '10',
						'lpa-questionnaire-due-date-month': '12'
					},
					expectedError: 'LPA questionnaire due date must include a year</a>'
				},
				{
					name: 'not a real date',
					payload: {
						'lpa-questionnaire-due-date-day': '29',
						'lpa-questionnaire-due-date-month': '2',
						'lpa-questionnaire-due-date-year': '3000'
					},
					expectedError: 'LPA questionnaire due date must be a real date</a>'
				},
				{
					name: 'must be in the future',
					payload: {
						'lpa-questionnaire-due-date-day': '25',
						'lpa-questionnaire-due-date-month': '2',
						'lpa-questionnaire-due-date-year': '1950'
					},
					expectedError: 'The lpa questionnaire due date must be in the future</a>'
				}
			])(
				'should re-render edit timetable page with $name error based on payload',
				async ({ payload, expectedError }) => {
					const response = await request.post(`${baseUrl}/edit`).send(payload);

					const element = parseHtml(response.text);

					expect(element.innerHTML).toMatchSnapshot();
					expect(element.innerHTML).toContain(expectedError);
					expect(element.innerHTML).toContain(
						'<h2 class="govuk-error-summary__title"> There is a problem</h2>'
					);
					expect(element.innerHTML).toContain('LPA questionnaire due');
					expect(element.innerHTML).toContain('name="lpa-questionnaire-due-date-day');
					expect(element.innerHTML).toContain('name="lpa-questionnaire-due-date-month"');
					expect(element.innerHTML).toContain('name="lpa-questionnaire-due-date-year"');
					expect(element.innerHTML).toContain('Continue</button>');
				}
			);

			it('should redirect to the timetable CYA page if required due dates are present in the request body and in the correct format', async () => {
				const response = await request.post(`${baseUrl}/edit`).send({
					'lpa-questionnaire-due-date-day': '10',
					'lpa-questionnaire-due-date-month': '10',
					'lpa-questionnaire-due-date-year': '2050',
					'final-comments-due-date': { day: '04', month: '10', year: '2050' }
				});

				expect(response.statusCode).toBe(302);
				expect(response.text).toBe(
					'Found. Redirecting to /appeals-service/appeal-details/1/timetable/edit/check'
				);
			});
		});

		describe('S78 written', () => {
			const appealData = {
				...baseAppealData,
				appealTimetable: {
					appealTimetableId: 1
				},
				appealType: 'Planning appeal',
				appealStatus: 'lpa_questionnaire'
			};

			beforeEach(() => {
				nock.cleanAll();
				nock('http://test/').get('/appeals/1').reply(200, appealData).persist();
				nock('http://test/')
					.get('/appeals/1/appellant-cases/0')
					.reply(200, { planningObligation: { hasObligation: false } })
					.persist();
				nock('http://test/')
					.post(`/appeals/validate-business-date`)
					.reply(200, { result: true })
					.persist();
			});
			afterEach(() => {
				nock.cleanAll();
			});
			const baseValidS78PayloadParts = {
				'lpa-questionnaire-due-date': { day: '01', month: '10', year: '2050' },
				'lpa-statement-due-date': { day: '02', month: '10', year: '2050' },
				'ip-comments-due-date': { day: '03', month: '10', year: '2050' },
				'final-comments-due-date': { day: '04', month: '10', year: '2050' }
			};

			/**
			 * @returns {{
			 * 'lpa-questionnaire-due-date-day': string,
			 * 'lpa-questionnaire-due-date-month': string,
			 * 'lpa-questionnaire-due-date-year': string,
			 * 'lpa-statement-due-date-day': string,
			 * 'lpa-statement-due-date-month': string,
			 * 'lpa-statement-due-date-year': string,
			 * 'ip-comments-due-date-day': string,
			 * 'ip-comments-due-date-month': string,
			 * 'ip-comments-due-date-year': string,
			 * 'final-comments-due-date-day': string,
			 * 'final-comments-due-date-month': string,
			 * 'final-comments-due-date-year': string
			 * }}
			 */
			const getBaseValidS78Payload = () => ({
				'lpa-questionnaire-due-date-day':
					baseValidS78PayloadParts['lpa-questionnaire-due-date'].day,
				'lpa-questionnaire-due-date-month':
					baseValidS78PayloadParts['lpa-questionnaire-due-date'].month,
				'lpa-questionnaire-due-date-year':
					baseValidS78PayloadParts['lpa-questionnaire-due-date'].year,
				'lpa-statement-due-date-day': baseValidS78PayloadParts['lpa-statement-due-date'].day,
				'lpa-statement-due-date-month': baseValidS78PayloadParts['lpa-statement-due-date'].month,
				'lpa-statement-due-date-year': baseValidS78PayloadParts['lpa-statement-due-date'].year,
				'ip-comments-due-date-day': baseValidS78PayloadParts['ip-comments-due-date'].day,
				'ip-comments-due-date-month': baseValidS78PayloadParts['ip-comments-due-date'].month,
				'ip-comments-due-date-year': baseValidS78PayloadParts['ip-comments-due-date'].year,
				'final-comments-due-date-day': baseValidS78PayloadParts['final-comments-due-date'].day,
				'final-comments-due-date-month': baseValidS78PayloadParts['final-comments-due-date'].month,
				'final-comments-due-date-year': baseValidS78PayloadParts['final-comments-due-date'].year
			});

			const timetableTypes = [
				{
					id: 'lpa-questionnaire',
					label: 'LPA questionnaire'
				},
				{
					id: 'lpa-statement',
					label: 'Statements'
				},
				{
					id: 'ip-comments',
					label: 'Interested party comments'
				},
				{
					id: 'final-comments',
					label: 'Final comments'
				}
			];

			const testCases = [
				{
					name: 'missing day',
					payload: (/** @type {string} */ id) => ({
						[`${id}-due-date-month`]: '10',
						[`${id}-due-date-year`]: '2050'
					}),
					expectedError: (/** @type {string} */ label) => `${label} due date must include a day</a>`
				},
				{
					name: 'missing month',
					payload: (/** @type {string} */ id) => ({
						[`${id}-due-date-day`]: '10',
						[`${id}-due-date-year`]: '2050'
					}),
					expectedError: (/** @type {string} */ label) =>
						`${label} due date must include a month</a>`
				},
				{
					name: 'missing year',
					payload: (/** @type {string} */ id) => ({
						[`${id}-due-date-day`]: '10',
						[`${id}-due-date-month`]: '12'
					}),
					expectedError: (/** @type {string} */ label) =>
						`${label} due date must include a year</a>`
				},
				{
					name: 'not a real date',
					payload: (/** @type {string} */ id) => ({
						[`${id}-due-date-day`]: '29',
						[`${id}-due-date-month`]: '2',
						[`${id}-due-date-year`]: '3000'
					}),
					expectedError: (/** @type {string} */ label) =>
						`${label} due date must be a real date</a>`
				},
				{
					name: 'must be in the future',
					payload: (/** @type {string} */ id) => ({
						[`${id}-due-date-day`]: '25',
						[`${id}-due-date-month`]: '2',
						[`${id}-due-date-year`]: '1950'
					}),
					expectedError: (/** @type {string} */ label) =>
						`The ${label.toLowerCase()} due date must be in the future</a>`
				}
			];

			timetableTypes.forEach(({ id: currentFieldId, label }) => {
				describe(`${label}`, () => {
					it.each(testCases)(
						'should re-render edit timetable page with $name error for ' + label,
						async (testCase) => {
							const payloadForTest = getBaseValidS78Payload();

							// Define the keys for the field under test
							const dayKey = /** @type {keyof typeof payloadForTest} */ (
								`${currentFieldId}-due-date-day`
							);
							const monthKey = /** @type {keyof typeof payloadForTest} */ (
								`${currentFieldId}-due-date-month`
							);
							const yearKey = /** @type {keyof typeof payloadForTest} */ (
								`${currentFieldId}-due-date-year`
							);

							// Remove the valid parts for the field under test, so it can be replaced by the error-inducing parts
							// Check if keys exist before deleting (though they should, given the structure)
							if (dayKey in payloadForTest) delete payloadForTest[dayKey];
							if (monthKey in payloadForTest) delete payloadForTest[monthKey];
							if (yearKey in payloadForTest) delete payloadForTest[yearKey];

							// Apply the specific error-inducing payload for the current field
							const errorInducingParts = testCase.payload(currentFieldId);
							for (const key in errorInducingParts) {
								if (Object.prototype.hasOwnProperty.call(errorInducingParts, key)) {
									// Cast 'key' to tell TypeScript it's a valid key for payloadForTest
									payloadForTest[/** @type {keyof typeof payloadForTest} */ (key)] =
										errorInducingParts[key];
								}
							}

							const response = await request.post(`${baseUrl}/edit`).send(payloadForTest);
							const element = parseHtml(response.text);

							expect(element.innerHTML).toMatchSnapshot();
							expect(element.innerHTML).toContain(
								'<h2 class="govuk-error-summary__title"> There is a problem</h2>'
							);
							expect(element.innerHTML).toContain(testCase.expectedError(label));
						}
					);
				});
			});

			it('should redirect to the timetable CYA page if required due dates are present in the request body', async () => {
				const response = await request.post(`${baseUrl}/edit`).send({
					'lpa-questionnaire-due-date-day': '10',
					'lpa-questionnaire-due-date-month': '10',
					'lpa-questionnaire-due-date-year': '2050',
					'lpa-statement-due-date-day': '10',
					'lpa-statement-due-date-month': '10',
					'lpa-statement-due-date-year': '2050',
					'ip-comments-due-date-day': '10',
					'ip-comments-due-date-month': '10',
					'ip-comments-due-date-year': '2050',
					'final-comments-due-date-day': '10',
					'final-comments-due-date-month': '10',
					'final-comments-due-date-year': '2050'
				});

				expect(response.statusCode).toBe(302);
				expect(response.text).toBe(
					'Found. Redirecting to /appeals-service/appeal-details/1/timetable/edit/check'
				);
			});

			it('should re-render edit timetable page with date has to be after error', async () => {
				const appeal = {
					...baseAppealData,
					appealTimetable: {
						appealTimetableId: 1,
						finalCommentsDueDate: '2025-08-07T22:59:00.000Z',
						ipCommentsDueDate: '2025-08-26T22:59:00.000Z',
						lpaQuestionnaireDueDate: '2025-06-27T22:59:00.000Z',
						lpaStatementDueDate: '2025-07-25T22:59:00.000Z'
					},
					appealType: 'Planning appeal',
					appealStatus: 'lpa_questionnaire'
				};

				nock.cleanAll();
				nock('http://test/')
					.get('/appeals/1/appellant-cases/0')
					.reply(200, { planningObligation: { hasObligation: false } });
				nock('http://test/').get('/appeals/1').reply(200, appeal).persist();
				nock('http://test/')
					.post(`/appeals/validate-business-date`)
					.reply(200, { result: true })
					.persist();

				const payload = {
					'lpa-questionnaire-due-date-day': '5',
					'lpa-questionnaire-due-date-month': '10',
					'lpa-questionnaire-due-date-year': '2050',
					'lpa-statement-due-date-day': '4',
					'lpa-statement-due-date-month': '10',
					'lpa-statement-due-date-year': '2050',
					'ip-comments-due-date-day': '4',
					'ip-comments-due-date-month': '10',
					'ip-comments-due-date-year': '2050',
					'final-comments-due-date-day': '3',
					'final-comments-due-date-month': '10',
					'final-comments-due-date-year': '2050'
				};

				const response = await request.post(`${baseUrl}/edit`).send(payload);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();
				expect(element.innerHTML).toContain(
					'<h2 class="govuk-error-summary__title"> There is a problem</h2>'
				);
				expect(element.innerHTML).toContain(
					'Statements due date must be after the LPA questionnaire due date on 5 October 2050</a>'
				);
				expect(element.innerHTML).toContain(
					'Interested party comments due date must be after the LPA questionnaire due date on 5 October 2050</a>'
				);
				expect(element.innerHTML).toContain(
					'Final comments due date must be after the statements due date on 4 October 2050</a>'
				);
			});

			it('should re-render edit timetable page and replay entered dates to the user', async () => {
				const appeal = {
					...baseAppealData,
					appealTimetable: {
						appealTimetableId: 1,
						finalCommentsDueDate: '2025-08-07T22:59:00.000Z',
						ipCommentsDueDate: '2025-08-26T22:59:00.000Z',
						lpaQuestionnaireDueDate: '2025-06-27T22:59:00.000Z',
						lpaStatementDueDate: '2025-07-25T22:59:00.000Z'
					},
					appealType: 'Planning appeal',
					appealStatus: 'lpa_questionnaire'
				};

				nock.cleanAll();
				nock('http://test/')
					.get('/appeals/1/appellant-cases/0')
					.reply(200, { planningObligation: { hasObligation: false } });
				nock('http://test/').get('/appeals/1').reply(200, appeal).persist();
				nock('http://test/')
					.post(`/appeals/validate-business-date`)
					.reply(200, { result: true })
					.persist();

				const payload = {
					'lpa-questionnaire-due-date-day': '5',
					'lpa-questionnaire-due-date-month': '10',
					'lpa-questionnaire-due-date-year': '2050'
				};

				const response = await request.post(`${baseUrl}/edit`).send(payload);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				//Removing white spaces for multi-line check
				expect(element.innerHTML.replace(/\s+/g, ' ')).toContain(
					'id="lpa-questionnaire-due-date-day" name="lpa-questionnaire-due-date-day" type="text" value="5" inputmode="numeric">'
				);
				expect(element.innerHTML.replace(/\s+/g, ' ')).toContain(
					'id="lpa-questionnaire-due-date-month" name="lpa-questionnaire-due-date-month" type="text" value="10" inputmode="numeric">'
				);
				expect(element.innerHTML.replace(/\s+/g, ' ')).toContain(
					'id="lpa-questionnaire-due-date-year" name="lpa-questionnaire-due-date-year" type="text" value="2050" inputmode="numeric">'
				);
			});
		});

		describe('S78 hearing', () => {
			const appealData = {
				...baseAppealData,
				appealTimetable: {
					appealTimetableId: 1
				},
				appealType: 'Planning appeal',
				appealStatus: 'lpa_questionnaire',
				procedureType: 'Hearing'
			};

			beforeEach(() => {
				nock.cleanAll();
				nock('http://test/').get('/appeals/1').reply(200, appealData).persist();
				nock('http://test/')
					.get('/appeals/1/appellant-cases/0')
					.reply(200, { planningObligation: { hasObligation: true } })
					.persist();
				nock('http://test/')
					.post(`/appeals/validate-business-date`)
					.reply(200, { result: true })
					.persist();
			});
			afterEach(() => {
				nock.cleanAll();
			});
			const baseValidHearingPayloadParts = {
				'lpa-questionnaire-due-date': { day: '01', month: '10', year: '2050' },
				'lpa-statement-due-date': { day: '02', month: '10', year: '2050' },
				'ip-comments-due-date': { day: '03', month: '10', year: '2050' },
				'statement-of-common-ground-due-date': { day: '04', month: '10', year: '2050' },
				'planning-obligation-due-date': { day: '05', month: '10', year: '2050' }
			};

			/**
			 * @returns {{
			 * 'lpa-questionnaire-due-date-day': string,
			 * 'lpa-questionnaire-due-date-month': string,
			 * 'lpa-questionnaire-due-date-year': string,
			 * 'lpa-statement-due-date-day': string,
			 * 'lpa-statement-due-date-month': string,
			 * 'lpa-statement-due-date-year': string,
			 * 'ip-comments-due-date-day': string,
			 * 'ip-comments-due-date-month': string,
			 * 'ip-comments-due-date-year': string,
			 * 'statement-of-common-ground-due-date-day': string,
			 * 'statement-of-common-ground-due-date-month': string,
			 * 'statement-of-common-ground-due-date-year': string,
			 * 'planning-obligation-due-date-day': string,
			 * 'planning-obligation-due-date-month': string,
			 * 'planning-obligation-due-date-year': string
			 * }}
			 */
			const getBaseValidHearingPayload = () => ({
				'lpa-questionnaire-due-date-day':
					baseValidHearingPayloadParts['lpa-questionnaire-due-date'].day,
				'lpa-questionnaire-due-date-month':
					baseValidHearingPayloadParts['lpa-questionnaire-due-date'].month,
				'lpa-questionnaire-due-date-year':
					baseValidHearingPayloadParts['lpa-questionnaire-due-date'].year,
				'lpa-statement-due-date-day': baseValidHearingPayloadParts['lpa-statement-due-date'].day,
				'lpa-statement-due-date-month':
					baseValidHearingPayloadParts['lpa-statement-due-date'].month,
				'lpa-statement-due-date-year': baseValidHearingPayloadParts['lpa-statement-due-date'].year,
				'ip-comments-due-date-day': baseValidHearingPayloadParts['ip-comments-due-date'].day,
				'ip-comments-due-date-month': baseValidHearingPayloadParts['ip-comments-due-date'].month,
				'ip-comments-due-date-year': baseValidHearingPayloadParts['ip-comments-due-date'].year,
				'statement-of-common-ground-due-date-day':
					baseValidHearingPayloadParts['statement-of-common-ground-due-date'].day,
				'statement-of-common-ground-due-date-month':
					baseValidHearingPayloadParts['statement-of-common-ground-due-date'].month,
				'statement-of-common-ground-due-date-year':
					baseValidHearingPayloadParts['statement-of-common-ground-due-date'].year,
				'planning-obligation-due-date-day':
					baseValidHearingPayloadParts['planning-obligation-due-date'].day,
				'planning-obligation-due-date-month':
					baseValidHearingPayloadParts['planning-obligation-due-date'].month,
				'planning-obligation-due-date-year':
					baseValidHearingPayloadParts['planning-obligation-due-date'].year
			});

			const timetableTypes = [
				{
					id: 'lpa-questionnaire',
					label: 'LPA questionnaire'
				},
				{
					id: 'lpa-statement',
					label: 'Statements'
				},
				{
					id: 'ip-comments',
					label: 'Interested party comments'
				},
				{
					id: 'statement-of-common-ground',
					label: 'Statement of common ground'
				},
				{
					id: 'planning-obligation',
					label: 'Planning obligation'
				}
			];

			const testCases = [
				{
					name: 'missing day',
					payload: (/** @type {string} */ id) => ({
						[`${id}-due-date-month`]: '10',
						[`${id}-due-date-year`]: '2050'
					}),
					expectedError: (/** @type {string} */ label) => `${label} due date must include a day</a>`
				},
				{
					name: 'missing month',
					payload: (/** @type {string} */ id) => ({
						[`${id}-due-date-day`]: '10',
						[`${id}-due-date-year`]: '2050'
					}),
					expectedError: (/** @type {string} */ label) =>
						`${label} due date must include a month</a>`
				},
				{
					name: 'missing year',
					payload: (/** @type {string} */ id) => ({
						[`${id}-due-date-day`]: '10',
						[`${id}-due-date-month`]: '12'
					}),
					expectedError: (/** @type {string} */ label) =>
						`${label} due date must include a year</a>`
				},
				{
					name: 'not a real date',
					payload: (/** @type {string} */ id) => ({
						[`${id}-due-date-day`]: '29',
						[`${id}-due-date-month`]: '2',
						[`${id}-due-date-year`]: '3000'
					}),
					expectedError: (/** @type {string} */ label) =>
						`${label} due date must be a real date</a>`
				},
				{
					name: 'must be in the future',
					payload: (/** @type {string} */ id) => ({
						[`${id}-due-date-day`]: '25',
						[`${id}-due-date-month`]: '2',
						[`${id}-due-date-year`]: '1950'
					}),
					expectedError: (/** @type {string} */ label) =>
						`The ${label.toLowerCase()} due date must be in the future</a>`
				}
			];

			timetableTypes.forEach(({ id: currentFieldId, label }) => {
				describe(`${label}`, () => {
					it.each(testCases)(
						'should re-render edit timetable page with $name error for ' + label,
						async (testCase) => {
							const payloadForTest = getBaseValidHearingPayload();

							// Define the keys for the field under test
							const dayKey = /** @type {keyof typeof payloadForTest} */ (
								`${currentFieldId}-due-date-day`
							);
							const monthKey = /** @type {keyof typeof payloadForTest} */ (
								`${currentFieldId}-due-date-month`
							);
							const yearKey = /** @type {keyof typeof payloadForTest} */ (
								`${currentFieldId}-due-date-year`
							);

							// Remove the valid parts for the field under test, so it can be replaced by the error-inducing parts
							// Check if keys exist before deleting (though they should, given the structure)
							if (dayKey in payloadForTest) delete payloadForTest[dayKey];
							if (monthKey in payloadForTest) delete payloadForTest[monthKey];
							if (yearKey in payloadForTest) delete payloadForTest[yearKey];

							// Apply the specific error-inducing payload for the current field
							const errorInducingParts = testCase.payload(currentFieldId);
							for (const key in errorInducingParts) {
								if (Object.prototype.hasOwnProperty.call(errorInducingParts, key)) {
									// Cast 'key' to tell TypeScript it's a valid key for payloadForTest
									payloadForTest[/** @type {keyof typeof payloadForTest} */ (key)] =
										errorInducingParts[key];
								}
							}

							const response = await request.post(`${baseUrl}/edit`).send(payloadForTest);
							const element = parseHtml(response.text);

							expect(element.innerHTML).toMatchSnapshot();
							expect(element.innerHTML).toContain(
								'<h2 class="govuk-error-summary__title"> There is a problem</h2>'
							);
							expect(element.innerHTML).toContain(testCase.expectedError(label));
						}
					);
				});
			});

			it('should redirect to the timetable CYA page if required due dates are present in the request body', async () => {
				const response = await request.post(`${baseUrl}/edit`).send({
					'lpa-questionnaire-due-date-day': '10',
					'lpa-questionnaire-due-date-month': '10',
					'lpa-questionnaire-due-date-year': '2050',
					'lpa-statement-due-date-day': '10',
					'lpa-statement-due-date-month': '10',
					'lpa-statement-due-date-year': '2050',
					'ip-comments-due-date-day': '10',
					'ip-comments-due-date-month': '10',
					'ip-comments-due-date-year': '2050',
					'statement-of-common-ground-due-date-day': '10',
					'statement-of-common-ground-due-date-month': '10',
					'statement-of-common-ground-due-date-year': '2050',
					'planning-obligation-due-date-day': '10',
					'planning-obligation-due-date-month': '10',
					'planning-obligation-due-date-year': '2050'
				});

				expect(response.statusCode).toBe(302);
				expect(response.text).toBe(
					'Found. Redirecting to /appeals-service/appeal-details/1/timetable/edit/check'
				);
			});
		});
	});

	describe('GET /edit/check', () => {
		const appealData = {
			...baseAppealData,
			appealTimetable: {
				appealTimetableId: 1
			}
		};

		beforeEach(() => {
			nock.cleanAll();
			nock('http://test/').get('/appeals/1').reply(200, appealData).persist();
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, { planningObligation: { hasObligation: false } })
				.persist();
			nock('http://test/')
				.post(`/appeals/validate-business-date`)
				.reply(200, { result: true })
				.persist();
		});
		afterEach(() => {
			nock.cleanAll();
		});

		it('should render "Timetable CYA" page for householder appeal type', async () => {
			await request.post(`${baseUrl}/edit`).send({
				'lpa-questionnaire-due-date-day': '13',
				'lpa-questionnaire-due-date-month': '10',
				'lpa-questionnaire-due-date-year': '2030'
			});

			const response = await request.get(`${baseUrl}/edit/check`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('LPA questionnaire due</dt>');
			expect(element.innerHTML).toContain('13 October 2030</dd>');
			expect(element.innerHTML).toContain(
				'<a class="govuk-link" href="/appeals-service/appeal-details/1/timetable/edit">Change '
			);
			expect(element.innerHTML).toContain(
				'We’ll send an email to the appellant and LPA to tell them about the new'
			);
			expect(element.innerHTML).toContain('Update timetable due dates</button>');
		});

		it('should render correct "Timetable CYA" page for S78 appeal type and status lpa_questionnaire and lpaq NOT received', async () => {
			const appeal = {
				...baseAppealData,
				appealTimetable: {
					appealTimetableId: 1
				}
			};
			appeal.appealType = 'Planning appeal';
			appeal.appealStatus = 'lpa_questionnaire';

			nock.cleanAll();
			nock('http://test/')
				.post(`/appeals/validate-business-date`)
				.reply(200, { result: true })
				.persist();
			nock('http://test/').get('/appeals/1').reply(200, appeal).persist();
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, { planningObligation: { hasObligation: false } })
				.persist();

			await request.post(`${baseUrl}/edit`).send({
				'lpa-questionnaire-due-date-day': '13',
				'lpa-questionnaire-due-date-month': '10',
				'lpa-questionnaire-due-date-year': '2030',
				'lpa-statement-due-date-day': '14',
				'lpa-statement-due-date-month': '10',
				'lpa-statement-due-date-year': '2030',
				'ip-comments-due-date-day': '15',
				'ip-comments-due-date-month': '10',
				'ip-comments-due-date-year': '2030',
				'final-comments-due-date-day': '16',
				'final-comments-due-date-month': '10',
				'final-comments-due-date-year': '2030'
			});
			const response = await request.get(`${baseUrl}/edit/check`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('LPA questionnaire due</dt>');
			expect(element.innerHTML).toContain('13 October 2030</dd>');
			expect(element.innerHTML).toContain('Statements due</dt>');
			expect(element.innerHTML).toContain('14 October 2030</dd>');
			expect(element.innerHTML).toContain('Interested party comments due</dt>');
			expect(element.innerHTML).toContain('15 October 2030</dd>');
			expect(element.innerHTML).toContain('Final comments due</dt>');
			expect(element.innerHTML).toContain('16 October 2030</dd>');
			expect(element.innerHTML).toContain(
				'We’ll send an email to the appellant and LPA to tell them about the new'
			);
			expect(element.innerHTML).toContain('Update timetable due dates</button>');
		});

		it('should render correct "Timetable CYA" page for S78 appeal type and status lpa_questionnaire and lpaq received', async () => {
			const appeal = {
				...baseAppealData,
				appealTimetable: {
					appealTimetableId: 1
				}
			};
			appeal.appealType = 'Planning appeal';
			appeal.appealStatus = 'lpa_questionnaire';
			appeal.documentationSummary = {
				lpaQuestionnaire: {
					status: 'received',
					dueDate: '2024-10-11T10:27:06.626Z',
					receivedAt: '2024-08-02T10:27:06.626Z',
					representationStatus: 'awaiting_review'
				}
			};

			nock.cleanAll();
			nock('http://test/')
				.post(`/appeals/validate-business-date`)
				.reply(200, { result: true })
				.persist();
			nock('http://test/').get('/appeals/1').reply(200, appeal).persist();
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, { planningObligation: { hasObligation: false } })
				.persist();

			await request.post(`${baseUrl}/edit`).send({
				'lpa-statement-due-date-day': '14',
				'lpa-statement-due-date-month': '10',
				'lpa-statement-due-date-year': '2030',
				'ip-comments-due-date-day': '15',
				'ip-comments-due-date-month': '10',
				'ip-comments-due-date-year': '2030',
				'final-comments-due-date-day': '16',
				'final-comments-due-date-month': '10',
				'final-comments-due-date-year': '2030'
			});
			const response = await request.get(`${baseUrl}/edit/check`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Statements due</dt>');
			expect(element.innerHTML).toContain('14 October 2030</dd>');
			expect(element.innerHTML).toContain('Interested party comments due</dt>');
			expect(element.innerHTML).toContain('15 October 2030</dd>');
			expect(element.innerHTML).toContain('Final comments due</dt>');
			expect(element.innerHTML).toContain('16 October 2030</dd>');
			expect(element.innerHTML).toContain(
				'We’ll send an email to the appellant and LPA to tell them about the new'
			);
			expect(element.innerHTML).toContain('Update timetable due dates</button>');
		});

		it('should render correct "Timetable CYA" page for S78 appeal type and status statements', async () => {
			const appeal = {
				...baseAppealData,
				appealTimetable: {
					appealTimetableId: 1
				}
			};
			appeal.appealType = 'Planning appeal';
			appeal.appealStatus = 'statements';
			appeal.documentationSummary = {
				lpaQuestionnaire: {
					status: 'received',
					dueDate: '2024-10-11T10:27:06.626Z',
					receivedAt: '2024-08-02T10:27:06.626Z',
					representationStatus: 'awaiting_review'
				}
			};

			nock.cleanAll();
			nock('http://test/')
				.post(`/appeals/validate-business-date`)
				.reply(200, { result: true })
				.persist();
			nock('http://test/').get('/appeals/1').reply(200, appeal).persist();
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, { planningObligation: { hasObligation: false } })
				.persist();

			await request.post(`${baseUrl}/edit`).send({
				'lpa-statement-due-date-day': '14',
				'lpa-statement-due-date-month': '10',
				'lpa-statement-due-date-year': '2030',
				'ip-comments-due-date-day': '15',
				'ip-comments-due-date-month': '10',
				'ip-comments-due-date-year': '2030',
				'final-comments-due-date-day': '16',
				'final-comments-due-date-month': '10',
				'final-comments-due-date-year': '2030'
			});
			const response = await request.get(`${baseUrl}/edit/check`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Statements due</dt>');
			expect(element.innerHTML).toContain('14 October 2030</dd>');
			expect(element.innerHTML).toContain('Interested party comments due</dt>');
			expect(element.innerHTML).toContain('15 October 2030</dd>');
			expect(element.innerHTML).toContain('Final comments due</dt>');
			expect(element.innerHTML).toContain('16 October 2030</dd>');
			expect(element.innerHTML).toContain(
				'We’ll send an email to the appellant and LPA to tell them about the new'
			);
			expect(element.innerHTML).toContain('Update timetable due dates</button>');
		});

		it('should render correct "Timetable CYA" page for S78 appeal type and status final_comments', async () => {
			const appeal = {
				...baseAppealData,
				appealTimetable: {
					appealTimetableId: 1
				}
			};
			appeal.appealType = 'Planning appeal';
			appeal.appealStatus = 'final_comments';
			appeal.documentationSummary = {
				lpaQuestionnaire: {
					status: 'received',
					dueDate: '2024-10-11T10:27:06.626Z',
					receivedAt: '2024-08-02T10:27:06.626Z',
					representationStatus: 'awaiting_review'
				}
			};

			nock.cleanAll();
			nock('http://test/')
				.post(`/appeals/validate-business-date`)
				.reply(200, { result: true })
				.persist();
			nock('http://test/').get('/appeals/1').reply(200, appeal).persist();
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, { planningObligation: { hasObligation: false } })
				.persist();

			await request.post(`${baseUrl}/edit`).send({
				'final-comments-due-date-day': '16',
				'final-comments-due-date-month': '10',
				'final-comments-due-date-year': '2030'
			});
			const response = await request.get(`${baseUrl}/edit/check`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Final comments due</dt>');
			expect(element.innerHTML).toContain('16 October 2030</dd>');
			expect(element.innerHTML).toContain(
				'We’ll send an email to the appellant and LPA to tell them about the new'
			);
			expect(element.innerHTML).toContain('Update timetable due dates</button>');
		});

		it('should render correct "Timetable CYA" page for hearing appeal without planning obligation', async () => {
			const appeal = {
				...baseAppealData,
				appealStatus: 'lpa_questionnaire',
				appealTimetable: {
					appealTimetableId: 1
				},
				appealType: 'Planning appeal',
				documentationSummary: {
					lpaQuestionnaire: {
						status: 'received',
						dueDate: '2024-10-11T10:27:06.626Z',
						receivedAt: '2024-08-02T10:27:06.626Z',
						representationStatus: 'awaiting_review'
					}
				},
				procedureType: 'Hearing'
			};

			nock.cleanAll();
			nock('http://test/')
				.post(`/appeals/validate-business-date`)
				.reply(200, { result: true })
				.persist();
			nock('http://test/').get('/appeals/1').reply(200, appeal).persist();
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, { planningObligation: { hasObligation: false } })
				.persist();

			await request.post(`${baseUrl}/edit`).send({
				'lpa-statement-due-date-day': '14',
				'lpa-statement-due-date-month': '10',
				'lpa-statement-due-date-year': '2030',
				'ip-comments-due-date-day': '15',
				'ip-comments-due-date-month': '10',
				'ip-comments-due-date-year': '2030',
				'statement-of-common-ground-due-date-day': '17',
				'statement-of-common-ground-due-date-month': '10',
				'statement-of-common-ground-due-date-year': '2030',
				'planning-obligation-due-date-day': '18',
				'planning-obligation-due-date-month': '10',
				'planning-obligation-due-date-year': '2030'
			});
			const response = await request.get(`${baseUrl}/edit/check`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Statements due</dt>');
			expect(element.innerHTML).toContain('14 October 2030</dd>');
			expect(element.innerHTML).toContain('Interested party comments due</dt>');
			expect(element.innerHTML).toContain('15 October 2030</dd>');
			expect(element.innerHTML).toContain('Statement of common ground due</dt>');
			expect(element.innerHTML).toContain('17 October 2030</dd>');
			expect(element.innerHTML).toContain(
				'We’ll send an email to the appellant and LPA to tell them about the new'
			);
			expect(element.innerHTML).toContain('Update timetable due dates</button>');
		});

		it('should render correct "Timetable CYA" page for hearing appeal with planning obligation', async () => {
			const appeal = {
				...baseAppealData,
				appealStatus: 'lpa_questionnaire',
				appealTimetable: {
					appealTimetableId: 1
				},
				appealType: 'Planning appeal',
				documentationSummary: {
					lpaQuestionnaire: {
						status: 'received',
						dueDate: '2024-10-11T10:27:06.626Z',
						receivedAt: '2024-08-02T10:27:06.626Z',
						representationStatus: 'awaiting_review'
					}
				},
				procedureType: 'Hearing'
			};

			nock.cleanAll();
			nock('http://test/')
				.post(`/appeals/validate-business-date`)
				.reply(200, { result: true })
				.persist();
			nock('http://test/').get('/appeals/1').reply(200, appeal).persist();
			nock('http://test/')
				.get('/appeals/1/appellant-cases/0')
				.reply(200, { planningObligation: { hasObligation: true } })
				.persist();

			await request.post(`${baseUrl}/edit`).send({
				'lpa-statement-due-date-day': '14',
				'lpa-statement-due-date-month': '10',
				'lpa-statement-due-date-year': '2030',
				'ip-comments-due-date-day': '15',
				'ip-comments-due-date-month': '10',
				'ip-comments-due-date-year': '2030',
				'statement-of-common-ground-due-date-day': '17',
				'statement-of-common-ground-due-date-month': '10',
				'statement-of-common-ground-due-date-year': '2030',
				'planning-obligation-due-date-day': '18',
				'planning-obligation-due-date-month': '10',
				'planning-obligation-due-date-year': '2030'
			});
			const response = await request.get(`${baseUrl}/edit/check`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Statements due</dt>');
			expect(element.innerHTML).toContain('14 October 2030</dd>');
			expect(element.innerHTML).toContain('Interested party comments due</dt>');
			expect(element.innerHTML).toContain('15 October 2030</dd>');
			expect(element.innerHTML).toContain('Statement of common ground due</dt>');
			expect(element.innerHTML).toContain('17 October 2030</dd>');
			expect(element.innerHTML).toContain('Planning obligation due</dt>');
			expect(element.innerHTML).toContain('18 October 2030</dd>');
			expect(element.innerHTML).toContain(
				'We’ll send an email to the appellant and LPA to tell them about the new'
			);
			expect(element.innerHTML).toContain('Update timetable due dates</button>');
		});
	});
});
