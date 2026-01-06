import { appealData as baseAppealData } from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { jest } from '@jest/globals';
import { APPEAL_TYPE } from '@pins/appeals/constants/common';
import { parseHtml } from '@pins/platform';
import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';
import nock from 'nock';
import supertest from 'supertest';

const { app, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details/1/change-appeal-procedure-type';

describe('Change procedure timetable', () => {
	beforeEach(() => {
		//mocking the for example date for snapshots
		Date.now = jest.fn(() => new Date(Date.UTC(2024, 8, 14)).valueOf());
	});
	afterEach(() => {
		nock.cleanAll();
		teardown();
	});

	const matchingTimetables = {
		written: [
			'lpa-questionnaire-due-date-day',
			'lpa-questionnaire-due-date-month',
			'lpa-questionnaire-due-date-year',
			'lpa-statement-due-date-day',
			'lpa-statement-due-date-month',
			'lpa-statement-due-date-year',
			'ip-comments-due-date-day',
			'ip-comments-due-date-month',
			'ip-comments-due-date-year',
			'final-comments-due-date-day',
			'final-comments-due-date-month',
			'final-comments-due-date-year'
		],
		hearingWithoutPlanningObligation: [
			'lpa-questionnaire-due-date-day',
			'lpa-questionnaire-due-date-month',
			'lpa-questionnaire-due-date-year',
			'lpa-statement-due-date-day',
			'lpa-statement-due-date-month',
			'lpa-statement-due-date-year',
			'ip-comments-due-date-day',
			'ip-comments-due-date-month',
			'ip-comments-due-date-year',
			'statement-of-common-ground-due-date-day',
			'statement-of-common-ground-due-date-month',
			'statement-of-common-ground-due-date-year'
		],
		hearingWithPlanningObligation: [
			'lpa-questionnaire-due-date-day',
			'lpa-questionnaire-due-date-month',
			'lpa-questionnaire-due-date-year',
			'lpa-statement-due-date-day',
			'lpa-statement-due-date-month',
			'lpa-statement-due-date-year',
			'ip-comments-due-date-day',
			'ip-comments-due-date-month',
			'ip-comments-due-date-year',
			'statement-of-common-ground-due-date-day',
			'statement-of-common-ground-due-date-month',
			'statement-of-common-ground-due-date-year',
			'planning-obligation-due-date-day',
			'planning-obligation-due-date-month',
			'planning-obligation-due-date-year'
		],
		inquiry: [
			'lpa-questionnaire-due-date-day',
			'lpa-questionnaire-due-date-month',
			'lpa-questionnaire-due-date-year',
			'lpa-statement-due-date-day',
			'lpa-statement-due-date-month',
			'lpa-statement-due-date-year',
			'ip-comments-due-date-day',
			'ip-comments-due-date-month',
			'ip-comments-due-date-year',
			'statement-of-common-ground-due-date-day',
			'statement-of-common-ground-due-date-month',
			'statement-of-common-ground-due-date-year',
			'proof-of-evidence-and-witnesses-due-date-day',
			'proof-of-evidence-and-witnesses-due-date-month',
			'proof-of-evidence-and-witnesses-due-date-year'
		]
	};

	describe('GET /change-timetable', () => {
		describe.each([
			APPEAL_CASE_PROCEDURE.WRITTEN,
			APPEAL_CASE_PROCEDURE.HEARING,
			APPEAL_CASE_PROCEDURE.INQUIRY
		])('Written, Hearing and Inquiry', (appealProcedure) => {
			it(`should render correct "Timetable due dates" page for ${appealProcedure} with no planning obligation`, async () => {
				const appealData = {
					...baseAppealData,
					procedureType: appealProcedure,
					appealTimetable: {
						appealTimetableId: 1
					}
				};
				appealData.appealType = APPEAL_TYPE.S78;
				appealData.appealStatus = 'lpa_questionnaire';

				nock('http://test/').get('/appeals/1?include=all').reply(200, appealData).persist();
				nock('http://test/')
					.get('/appeals/1/appellant-cases/0')
					.reply(200, { planningObligation: { hasObligation: false } })
					.persist();

				const response = await request.get(`${baseUrl}/${appealProcedure}/change-timetable`);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();
				expect(element.innerHTML).toContain('Timetable due dates</h1>');

				const keyType =
					appealProcedure === APPEAL_CASE_PROCEDURE.HEARING
						? 'hearingWithoutPlanningObligation'
						: appealProcedure;
				/** @type {string[]} */
				// @ts-ignore
				const matchingItems = matchingTimetables[keyType];
				matchingItems.forEach((item) => {
					expect(element.innerHTML).toContain(`name="${item}"`);
				});
				expect(element.innerHTML).toContain('Continue</button>');
			});

			it(`should render correct "Timetable due dates" page for ${appealProcedure} with planning obligation`, async () => {
				const appealData = {
					...baseAppealData,
					procedureType: appealProcedure,
					appealTimetable: {
						appealTimetableId: 1
					}
				};
				appealData.appealType = APPEAL_TYPE.S78;
				appealData.appealStatus = 'lpa_questionnaire';

				nock('http://test/').get('/appeals/1?include=all').reply(200, appealData).persist();
				nock('http://test/')
					.get('/appeals/1/appellant-cases/0')
					.reply(200, { planningObligation: { hasObligation: true } })
					.persist();

				const response = await request.get(`${baseUrl}/${appealProcedure}/change-timetable`);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();
				expect(element.innerHTML).toContain('Timetable due dates</h1>');

				const keyType =
					appealProcedure === APPEAL_CASE_PROCEDURE.HEARING
						? 'hearingWithPlanningObligation'
						: appealProcedure;
				/** @type {string[]} */
				// @ts-ignore
				const matchingItems = matchingTimetables[keyType];
				matchingItems.forEach((item) => {
					expect(element.innerHTML).toContain(`name="${item}"`);
				});
				expect(element.innerHTML).toContain('Continue</button>');
			});

			it('should have a back link to the previous page', async () => {
				const appealData = {
					...baseAppealData,
					procedureType: appealProcedure,
					appealTimetable: {
						appealTimetableId: 1
					}
				};
				appealData.appealType = APPEAL_TYPE.S78;
				appealData.appealStatus = 'lpa_questionnaire';

				nock('http://test/').get('/appeals/1?include=all').reply(200, appealData).persist();
				nock('http://test/')
					.get('/appeals/1/appellant-cases/0')
					.reply(200, { planningObligation: { hasObligation: true } })
					.persist();

				const response = await request.get(`${baseUrl}/${appealProcedure}/change-timetable`);
				const bodyHtml = parseHtml(response.text, { rootElement: 'body' });
				expect(bodyHtml.querySelector('.govuk-back-link')?.getAttribute('href')).toBe(
					appealProcedure === APPEAL_CASE_PROCEDURE.WRITTEN
						? `${baseUrl}/change-selected-procedure-type`
						: `${baseUrl}/${appealProcedure}/address-details`
				);
			});

			it('should have a back link to the CYA page if editing', async () => {
				const appealData = {
					...baseAppealData,
					procedureType: appealProcedure,
					appealTimetable: {
						appealTimetableId: 1
					}
				};
				appealData.appealType = APPEAL_TYPE.S78;
				appealData.appealStatus = 'lpa_questionnaire';

				nock('http://test/').get('/appeals/1?include=all').reply(200, appealData).persist();
				nock('http://test/')
					.get('/appeals/1/appellant-cases/0')
					.reply(200, { planningObligation: { hasObligation: true } })
					.persist();

				const response = await request.get(
					`${baseUrl}/${appealProcedure}/change-timetable?editEntrypoint=` +
						`%2Fappeals-service%2Fappeal-details%2F1%2Fchange-appeal-procedure-type%2F${appealProcedure}%2Fchange-timetable`
				);
				const bodyHtml = parseHtml(response.text, { rootElement: 'body' });
				expect(bodyHtml.querySelector('.govuk-back-link')?.getAttribute('href')).toContain(
					`${baseUrl}/${appealProcedure}/check-and-confirm`
				);
			});
		});
	});

	describe('POST /change-timetable', () => {
		describe('S78 written', () => {
			const appealData = {
				...baseAppealData,
				appealTimetable: {
					appealTimetableId: 1
				},
				appealType: APPEAL_TYPE.S78,
				appealStatus: 'lpa_questionnaire'
			};

			beforeEach(() => {
				nock.cleanAll();
				nock('http://test/').get('/appeals/1?include=all').reply(200, appealData).persist();
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
						'should re-render change timetable page with $name error for ' + label,
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

							const response = await request
								.post(`${baseUrl}/written/change-timetable`)
								.send(payloadForTest);
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
				const response = await request.post(`${baseUrl}/written/change-timetable`).send({
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
					'Found. Redirecting to /appeals-service/appeal-details/1/change-appeal-procedure-type/written/check-and-confirm'
				);
			});

			it('should re-render change timetable page with date has to be after error', async () => {
				const appeal = {
					...baseAppealData,
					appealTimetable: {
						appealTimetableId: 1,
						finalCommentsDueDate: '2025-08-07T22:59:00.000Z',
						ipCommentsDueDate: '2025-08-26T22:59:00.000Z',
						lpaQuestionnaireDueDate: '2025-06-27T22:59:00.000Z',
						lpaStatementDueDate: '2025-07-25T22:59:00.000Z'
					},
					appealType: APPEAL_TYPE.S78,
					appealStatus: 'lpa_questionnaire'
				};

				nock.cleanAll();
				nock('http://test/')
					.get('/appeals/1/appellant-cases/0')
					.reply(200, { planningObligation: { hasObligation: false } });
				nock('http://test/').get('/appeals/1?include=all').reply(200, appeal).persist();
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

				const response = await request.post(`${baseUrl}/written/change-timetable`).send(payload);
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

			it('should re-render change timetable page and replay entered dates to the user', async () => {
				const appeal = {
					...baseAppealData,
					appealTimetable: {
						appealTimetableId: 1,
						finalCommentsDueDate: '2025-08-07T22:59:00.000Z',
						ipCommentsDueDate: '2025-08-26T22:59:00.000Z',
						lpaQuestionnaireDueDate: '2025-06-27T22:59:00.000Z',
						lpaStatementDueDate: '2025-07-25T22:59:00.000Z'
					},
					appealType: APPEAL_TYPE.S78,
					appealStatus: 'lpa_questionnaire'
				};

				nock.cleanAll();
				nock('http://test/')
					.get('/appeals/1/appellant-cases/0')
					.reply(200, { planningObligation: { hasObligation: false } });
				nock('http://test/').get('/appeals/1?include=all').reply(200, appeal).persist();
				nock('http://test/')
					.post(`/appeals/validate-business-date`)
					.reply(200, { result: true })
					.persist();

				const payload = {
					'lpa-questionnaire-due-date-day': '5',
					'lpa-questionnaire-due-date-month': '10',
					'lpa-questionnaire-due-date-year': '2050'
				};

				const response = await request.post(`${baseUrl}/written/change-timetable`).send(payload);
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
				appealType: APPEAL_TYPE.S78,
				appealStatus: 'lpa_questionnaire',
				procedureType: 'Hearing'
			};

			beforeEach(() => {
				nock.cleanAll();
				nock('http://test/').get('/appeals/1?include=all').reply(200, appealData).persist();
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
						'should re-render change timetable page with $name error for ' + label,
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

							const response = await request
								.post(`${baseUrl}/written/change-timetable`)
								.send(payloadForTest);
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
		});
	});
});
