// @ts-nocheck
import { parseHtml } from '@pins/platform';
import supertest from 'supertest';
import {
	appealDataFullPlanning,
	lpaQuestionnaireDataNotValidated
} from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import nock from 'nock';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';

describe('environmental-impact-assessment', () => {
	describe('LPA questionnaire page', () => {
		describe('column two threshold', () => {
			const testCases = [
				{ value: false, expectedContent: 'No' },
				{ value: true, expectedContent: 'Yes' }
			];

			for (const testCase of testCases) {
				it(`should render a row for "Meets or exceeds column 2 threshold criteria" with a value of "${testCase.expectedContent}" if eiaColumnTwoThreshold is ${testCase.value}`, async () => {
					nock('http://test/').get('/appeals/1').reply(200, appealDataFullPlanning);
					nock('http://test/')
						.get('/appeals/1/lpa-questionnaires/2')
						.reply(200, {
							...lpaQuestionnaireDataNotValidated,
							eiaColumnTwoThreshold: testCase.value
						});

					const response = await request.get(`${baseUrl}/1/lpa-questionnaire/2`);

					const rowKeyElement = parseHtml(response.text, {
						rootElement: '.lpa-eia-column-two-threshold .govuk-summary-list__key',
						skipPrettyPrint: true
					});
					expect(rowKeyElement.innerHTML).toContain('Meets or exceeds column 2 threshold criteria');

					const rowValueElement = parseHtml(response.text, {
						rootElement: '.lpa-eia-column-two-threshold .govuk-summary-list__value',
						skipPrettyPrint: true
					});
					expect(rowValueElement.innerHTML).toContain(testCase.expectedContent);
				});
			}
		});

		describe('requires-environmental-statement', () => {
			const testCases = [
				{ value: false, expectedContent: 'No' },
				{ value: true, expectedContent: 'Yes' }
			];

			for (const testCase of testCases) {
				it(`should render a row for "Screening opinion says environmental statement needed" with a value of "${testCase.expectedContent}" if eiaRequiresEnvironmentalStatement is ${testCase.value}`, async () => {
					nock('http://test/').get('/appeals/1').reply(200, appealDataFullPlanning);
					nock('http://test/')
						.get('/appeals/1/lpa-questionnaires/2')
						.reply(200, {
							...lpaQuestionnaireDataNotValidated,
							eiaRequiresEnvironmentalStatement: testCase.value
						});

					const response = await request.get(`${baseUrl}/1/lpa-questionnaire/2`);

					const rowKeyElement = parseHtml(response.text, {
						rootElement: '.lpa-eia-requires-environmental-statement .govuk-summary-list__key',
						skipPrettyPrint: true
					});
					expect(rowKeyElement.innerHTML).toContain(
						'Screening opinion says environmental statement needed'
					);

					const rowValueElement = parseHtml(response.text, {
						rootElement: '.lpa-eia-requires-environmental-statement .govuk-summary-list__value',
						skipPrettyPrint: true
					});
					expect(rowValueElement.innerHTML).toContain(testCase.expectedContent);
				});
			}
		});

		describe('sensitive-area-details', () => {
			const testCases = [
				{ value: null, expectedContent: ['No'] },
				{
					value: 'test sensitive area details text',
					expectedContent: ['Yes', 'test sensitive area details text']
				}
			];

			for (const testCase of testCases) {
				it(`should render a row for "In, partly in, or likely to affect a sensitive area" with a value of "${testCase.expectedContent.join(
					', '
				)}" if eiaSensitiveAreaDetails is "${testCase.value}"`, async () => {
					nock('http://test/').get('/appeals/1').reply(200, appealDataFullPlanning);
					nock('http://test/')
						.get('/appeals/1/lpa-questionnaires/2')
						.reply(200, {
							...lpaQuestionnaireDataNotValidated,
							eiaSensitiveAreaDetails: testCase.value
						});

					const response = await request.get(`${baseUrl}/1/lpa-questionnaire/2`);

					const rowKeyElement = parseHtml(response.text, {
						rootElement: '.lpa-eia-sensitive-area-details .govuk-summary-list__key',
						skipPrettyPrint: true
					});
					expect(rowKeyElement.innerHTML).toContain(
						'In, partly in, or likely to affect a sensitive area'
					);

					const rowValueElement = parseHtml(response.text, {
						rootElement: '.lpa-eia-sensitive-area-details .govuk-summary-list__value',
						skipPrettyPrint: true
					});

					for (const expectedContentItem of testCase.expectedContent) {
						expect(rowValueElement.innerHTML).toContain(expectedContentItem);
					}
				});
			}

			it('should render a row for "In, partly in, or likely to affect a sensitive area" with the value wrapped in a "show more" component, if eiaSensitiveAreaDetails is more than 300 characters in length', async () => {
				nock('http://test/').get('/appeals/1').reply(200, appealDataFullPlanning);
				nock('http://test/')
					.get('/appeals/1/lpa-questionnaires/2')
					.reply(200, {
						...lpaQuestionnaireDataNotValidated,
						eiaSensitiveAreaDetails: 'a'.repeat(301)
					});

				const response = await request.get(`${baseUrl}/1/lpa-questionnaire/2`);

				const rowValueElement = parseHtml(response.text, {
					rootElement: '.lpa-eia-sensitive-area-details .govuk-summary-list__value',
					skipPrettyPrint: true
				});
				expect(rowValueElement.innerHTML).toContain('pins-show-more');
			});
		});

		describe('consulted-bodies-details', () => {
			const testCases = [
				{ value: null, expectedContent: ['No'] },
				{
					value: 'test consulted bodies details text',
					expectedContent: ['Yes', 'test consulted bodies details text']
				}
			];

			for (const testCase of testCases) {
				it(`should render a row for "Consulted relevant statutory consultees" with a value of "${testCase.expectedContent.join(
					', '
				)}" if eiaConsultedBodiesDetails is "${testCase.value}"`, async () => {
					nock('http://test/').get('/appeals/1').reply(200, appealDataFullPlanning);
					nock('http://test/')
						.get('/appeals/1/lpa-questionnaires/2')
						.reply(200, {
							...lpaQuestionnaireDataNotValidated,
							eiaConsultedBodiesDetails: testCase.value
						});

					const response = await request.get(`${baseUrl}/1/lpa-questionnaire/2`);

					const rowKeyElement = parseHtml(response.text, {
						rootElement: '.lpa-eia-consulted-bodies-details .govuk-summary-list__key',
						skipPrettyPrint: true
					});
					expect(rowKeyElement.innerHTML).toContain('Consulted relevant statutory consultees');

					const rowValueElement = parseHtml(response.text, {
						rootElement: '.lpa-eia-consulted-bodies-details .govuk-summary-list__value',
						skipPrettyPrint: true
					});

					for (const expectedContentItem of testCase.expectedContent) {
						expect(rowValueElement.innerHTML).toContain(expectedContentItem);
					}
				});
			}

			it('should render a row for "Consulted relevant statutory consultees" with the value wrapped in a "show more" component, if eiaConsultedBodiesDetails is more than 300 characters in length', async () => {
				nock('http://test/').get('/appeals/1').reply(200, appealDataFullPlanning);
				nock('http://test/')
					.get('/appeals/1/lpa-questionnaires/2')
					.reply(200, {
						...lpaQuestionnaireDataNotValidated,
						eiaConsultedBodiesDetails: 'a'.repeat(301)
					});

				const response = await request.get(`${baseUrl}/1/lpa-questionnaire/2`);

				const rowValueElement = parseHtml(response.text, {
					rootElement: '.lpa-eia-consulted-bodies-details .govuk-summary-list__value',
					skipPrettyPrint: true
				});
				expect(rowValueElement.innerHTML).toContain('pins-show-more');
			});
		});
	});

	describe('change pages', () => {
		beforeEach(installMockApi);
		afterEach(teardown);

		describe('GET /environmental-impact-assessment/column-two-threshold/change', () => {
			it('should render the change eia column two threshold page with "Meets or exceeds" radio option checked if eiaColumnTwoThreshold is true', async () => {
				nock('http://test/')
					.get(`/appeals/1/lpa-questionnaires/${appealDataFullPlanning.lpaQuestionnaireId}`)
					.reply(200, {
						...lpaQuestionnaireDataNotValidated,
						eiaColumnTwoThreshold: true
					});

				const response = await request.get(
					`${baseUrl}/1/lpa-questionnaire/${appealDataFullPlanning.lpaQuestionnaireId}/environmental-impact-assessment/column-two-threshold/change`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain(
					'Change whether meets or exceeds column 2 threshold criteria</h1>'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'name="eiaColumnTwoThreshold" type="radio" value="yes" checked>'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'<label class="govuk-label govuk-radios__label" for="eia-column-two-threshold"> Meets or exceeds</label>'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'name="eiaColumnTwoThreshold" type="radio" value="no">'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'<label class="govuk-label govuk-radios__label" for="eia-column-two-threshold-2"> Does not meet or exceed</label>'
				);
				expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
			});

			it('should render the change eia column two threshold page with "Does not meet or exceed" radio option checked if eiaColumnTwoThreshold is false', async () => {
				nock('http://test/')
					.get(`/appeals/1/lpa-questionnaires/${appealDataFullPlanning.lpaQuestionnaireId}`)
					.reply(200, {
						...lpaQuestionnaireDataNotValidated,
						eiaColumnTwoThreshold: false
					});

				const response = await request.get(
					`${baseUrl}/1/lpa-questionnaire/${appealDataFullPlanning.lpaQuestionnaireId}/environmental-impact-assessment/column-two-threshold/change`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain(
					'Change whether meets or exceeds column 2 threshold criteria</h1>'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'name="eiaColumnTwoThreshold" type="radio" value="yes">'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'<label class="govuk-label govuk-radios__label" for="eia-column-two-threshold"> Meets or exceeds</label>'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'name="eiaColumnTwoThreshold" type="radio" value="no" checked>'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'<label class="govuk-label govuk-radios__label" for="eia-column-two-threshold-2"> Does not meet or exceed</label>'
				);
				expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
			});
		});

		describe('POST /environmental-impact-assessment/column-two-threshold/change', () => {
			const validValues = ['yes', 'no'];

			for (const validValue of validValues) {
				it(`should call LPA questionnaires PATCH endpoint and redirect to the LPA questionnaire page if "${validValue}" is selected`, async () => {
					const mockLPAQPatchEndpoint = nock('http://test/')
						.patch(`/appeals/1/lpa-questionnaires/${appealDataFullPlanning.lpaQuestionnaireId}`)
						.reply(200, {});

					const response = await request
						.post(
							`${baseUrl}/1/lpa-questionnaire/${appealDataFullPlanning.lpaQuestionnaireId}/environmental-impact-assessment/column-two-threshold/change`
						)
						.send({
							eiaColumnTwoThreshold: validValue
						});

					expect(mockLPAQPatchEndpoint.isDone()).toBe(true);
					expect(response.statusCode).toBe(302);
					expect(response.text).toBe(
						`Found. Redirecting to /appeals-service/appeal-details/1/lpa-questionnaire/${appealDataFullPlanning.lpaQuestionnaireId}`
					);
				});
			}
		});

		describe('GET /environmental-impact-assessment/requires-environmental-statement/change', () => {
			it('should render the change eia requires environmental statement page with "Needed" radio option checked if eiaRequiresEnvironmentalStatement is true', async () => {
				nock('http://test/')
					.get(`/appeals/1/lpa-questionnaires/${appealDataFullPlanning.lpaQuestionnaireId}`)
					.reply(200, {
						...lpaQuestionnaireDataNotValidated,
						eiaRequiresEnvironmentalStatement: true
					});

				const response = await request.get(
					`${baseUrl}/1/lpa-questionnaire/${appealDataFullPlanning.lpaQuestionnaireId}/environmental-impact-assessment/requires-environmental-statement/change`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain(
					'Change opinion that environmental statement needed</h1>'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'name="eiaRequiresEnvironmentalStatement" type="radio" value="yes" checked>'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'<label class="govuk-label govuk-radios__label" for="eia-requires-environmental-statement"> Needed</label>'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'name="eiaRequiresEnvironmentalStatement" type="radio" value="no">'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'<label class="govuk-label govuk-radios__label" for="eia-requires-environmental-statement-2"> Not needed</label>'
				);
				expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
			});

			it('should render the change eia requires environmental statement page with "Not needed" radio option checked if eiaRequiresEnvironmentalStatement is false', async () => {
				nock('http://test/')
					.get(`/appeals/1/lpa-questionnaires/${appealDataFullPlanning.lpaQuestionnaireId}`)
					.reply(200, {
						...lpaQuestionnaireDataNotValidated,
						eiaRequiresEnvironmentalStatement: false
					});

				const response = await request.get(
					`${baseUrl}/1/lpa-questionnaire/${appealDataFullPlanning.lpaQuestionnaireId}/environmental-impact-assessment/requires-environmental-statement/change`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain(
					'Change opinion that environmental statement needed</h1>'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'name="eiaRequiresEnvironmentalStatement" type="radio" value="yes">'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'<label class="govuk-label govuk-radios__label" for="eia-requires-environmental-statement"> Needed</label>'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'name="eiaRequiresEnvironmentalStatement" type="radio" value="no" checked>'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'<label class="govuk-label govuk-radios__label" for="eia-requires-environmental-statement-2"> Not needed</label>'
				);
				expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
			});
		});

		describe('POST /environmental-impact-assessment/requires-environmental-statement/change', () => {
			const validValues = ['yes', 'no'];

			for (const validValue of validValues) {
				it(`should call LPA questionnaires PATCH endpoint and redirect to the LPA questionnaire page if "${validValue}" is selected`, async () => {
					const mockLPAQPatchEndpoint = nock('http://test/')
						.patch(`/appeals/1/lpa-questionnaires/${appealDataFullPlanning.lpaQuestionnaireId}`)
						.reply(200, {});

					const response = await request
						.post(
							`${baseUrl}/1/lpa-questionnaire/${appealDataFullPlanning.lpaQuestionnaireId}/environmental-impact-assessment/requires-environmental-statement/change`
						)
						.send({
							eiaRequiresEnvironmentalStatement: validValue
						});

					expect(mockLPAQPatchEndpoint.isDone()).toBe(true);
					expect(response.statusCode).toBe(302);
					expect(response.text).toBe(
						`Found. Redirecting to /appeals-service/appeal-details/1/lpa-questionnaire/${appealDataFullPlanning.lpaQuestionnaireId}`
					);
				});
			}
		});

		describe('GET /environmental-impact-assessment/sensitive-area-details/change', () => {
			it('should render the change sensitive area details page with "No" radio option checked, and no text populated in the textarea, if eiaSensitiveAreaDetails is null', async () => {
				nock('http://test/').get('/appeals/1').reply(200, appealDataFullPlanning);
				nock('http://test/')
					.get(`/appeals/1/lpa-questionnaires/${appealDataFullPlanning.lpaQuestionnaireId}`)
					.reply(200, {
						...lpaQuestionnaireDataNotValidated,
						eiaSensitiveAreaDetails: null
					});

				const response = await request.get(
					`${baseUrl}/1/lpa-questionnaire/${appealDataFullPlanning.lpaQuestionnaireId}/environmental-impact-assessment/sensitive-area-details/change`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain(
					'Change whether in, partly in, or likely to affect a sensitive area</h1>'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'name="eiaSensitiveAreaDetailsRadio" type="radio" value="yes"'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'name="eiaSensitiveAreaDetailsRadio" type="radio" value="no" checked'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'<textarea class="govuk-textarea" id="eia-sensitive-area-details" name="eiaSensitiveAreaDetails" rows="3"></textarea>'
				);
				expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
			});

			it('should render the change sensitive area details page with "Yes" radio option checked, and "test sensitive area details" populated in the textarea, if eiaSensitiveAreaDetails is "test sensitive area details"', async () => {
				nock('http://test/').get('/appeals/1').reply(200, appealDataFullPlanning);
				nock('http://test/')
					.get(`/appeals/1/lpa-questionnaires/${appealDataFullPlanning.lpaQuestionnaireId}`)
					.reply(200, {
						...lpaQuestionnaireDataNotValidated,
						eiaSensitiveAreaDetails: 'test sensitive area details'
					});

				const response = await request.get(
					`${baseUrl}/1/lpa-questionnaire/${appealDataFullPlanning.lpaQuestionnaireId}/environmental-impact-assessment/sensitive-area-details/change`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain(
					'Change whether in, partly in, or likely to affect a sensitive area</h1>'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'name="eiaSensitiveAreaDetailsRadio" type="radio" value="yes" checked'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'name="eiaSensitiveAreaDetailsRadio" type="radio" value="no"'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'<textarea class="govuk-textarea" id="eia-sensitive-area-details" name="eiaSensitiveAreaDetails" rows="3">test sensitive area details</textarea>'
				);
				expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
			});
		});

		describe('POST /environmental-impact-assessment/sensitive-area-details/change', () => {
			it('should re-render the change sensitive area details page with the expected validation error and the "yes" radio option checked, if "yes" was selected but no text was entered in the details textarea', async () => {
				nock('http://test/').get('/appeals/1').reply(200, appealDataFullPlanning);
				nock('http://test/')
					.get(`/appeals/1/lpa-questionnaires/${appealDataFullPlanning.lpaQuestionnaireId}`)
					.reply(200, {
						...lpaQuestionnaireDataNotValidated,
						eiaSensitiveAreaDetails: null
					});

				const response = await request
					.post(
						`${baseUrl}/1/lpa-questionnaire/${appealDataFullPlanning.lpaQuestionnaireId}/environmental-impact-assessment/sensitive-area-details/change`
					)
					.send({
						eiaSensitiveAreaDetailsRadio: 'yes',
						eiaSensitiveAreaDetails: ''
					});

				expect(response.statusCode).toBe(200);

				const elementInnerHtml = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

				expect(elementInnerHtml).toContain(
					'Change whether in, partly in, or likely to affect a sensitive area</h1>'
				);
				expect(elementInnerHtml).toContain(
					'name="eiaSensitiveAreaDetailsRadio" type="radio" value="yes" checked'
				);
				expect(elementInnerHtml).toContain(
					'name="eiaSensitiveAreaDetailsRadio" type="radio" value="no"'
				);

				const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
					rootElement: '.govuk-error-summary',
					skipPrettyPrint: true
				}).innerHTML;

				expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
				expect(unprettifiedErrorSummaryHtml).toContain(
					'Enter in, partly in, or likely to affect a sensitive area details</a>'
				);
			});

			it('should re-render the change sensitive area details page with the expected validation error, and the "yes" radio option checked, and the details textarea pre-populated with the submitted text, if "yes" was selected and the text entered in the details textarea exceeds 1000 characters in length', async () => {
				nock('http://test/').get('/appeals/1').reply(200, appealDataFullPlanning);
				nock('http://test/')
					.get(`/appeals/1/lpa-questionnaires/${appealDataFullPlanning.lpaQuestionnaireId}`)
					.reply(200, {
						...lpaQuestionnaireDataNotValidated,
						eiaSensitiveAreaDetails: null
					});

				const submittedText = 'a'.repeat(1001);

				const response = await request
					.post(
						`${baseUrl}/1/lpa-questionnaire/${appealDataFullPlanning.lpaQuestionnaireId}/environmental-impact-assessment/sensitive-area-details/change`
					)
					.send({
						eiaSensitiveAreaDetailsRadio: 'yes',
						eiaSensitiveAreaDetails: submittedText
					});

				expect(response.statusCode).toBe(200);

				const elementInnerHtml = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

				expect(elementInnerHtml).toContain(
					'Change whether in, partly in, or likely to affect a sensitive area</h1>'
				);
				expect(elementInnerHtml).toContain(
					'name="eiaSensitiveAreaDetailsRadio" type="radio" value="yes" checked'
				);
				expect(elementInnerHtml).toContain(
					'name="eiaSensitiveAreaDetailsRadio" type="radio" value="no"'
				);
				expect(elementInnerHtml).toContain(`${submittedText}</textarea>`);

				const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
					rootElement: '.govuk-error-summary',
					skipPrettyPrint: true
				}).innerHTML;

				expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
				expect(unprettifiedErrorSummaryHtml).toContain(
					'In, partly in, or likely to affect a sensitive area details must be 1000 characters or less</a>'
				);
			});

			it('should call LPA questionnaires PATCH endpoint and redirect to the LPA questionnaire page if "no" was selected', async () => {
				const mockLPAQPatchEndpoint = nock('http://test/')
					.patch(`/appeals/1/lpa-questionnaires/${appealDataFullPlanning.lpaQuestionnaireId}`)
					.reply(200, {});

				const response = await request
					.post(
						`${baseUrl}/1/lpa-questionnaire/${appealDataFullPlanning.lpaQuestionnaireId}/environmental-impact-assessment/sensitive-area-details/change`
					)
					.send({
						eiaSensitiveAreaDetailsRadio: 'no',
						eiaSensitiveAreaDetails: ''
					});

				expect(mockLPAQPatchEndpoint.isDone()).toBe(true);
				expect(response.statusCode).toBe(302);
				expect(response.text).toBe(
					`Found. Redirecting to /appeals-service/appeal-details/1/lpa-questionnaire/${appealDataFullPlanning.lpaQuestionnaireId}`
				);
			});

			it('should call LPA questionnaires PATCH endpoint and redirect to the LPA questionnaire page if "yes" was selected, and the text entered in the details textarea is between 1 and 1000 characters in length', async () => {
				const mockLPAQPatchEndpoint = nock('http://test/')
					.patch(`/appeals/1/lpa-questionnaires/${appealDataFullPlanning.lpaQuestionnaireId}`)
					.reply(200, {});

				const response = await request
					.post(
						`${baseUrl}/1/lpa-questionnaire/${appealDataFullPlanning.lpaQuestionnaireId}/environmental-impact-assessment/sensitive-area-details/change`
					)
					.send({
						eiaSensitiveAreaDetailsRadio: 'yes',
						eiaSensitiveAreaDetails: 'a'.repeat(1000)
					});

				expect(mockLPAQPatchEndpoint.isDone()).toBe(true);
				expect(response.statusCode).toBe(302);
				expect(response.text).toBe(
					`Found. Redirecting to /appeals-service/appeal-details/1/lpa-questionnaire/${appealDataFullPlanning.lpaQuestionnaireId}`
				);
			});
		});

		describe('GET /environmental-impact-assessment/consulted-bodies-details/change', () => {
			it('should render the change consulted bodies details page with "No" radio option checked, and no text populated in the textarea, if eiaConsultedBodiesDetails is null', async () => {
				nock('http://test/').get('/appeals/1').reply(200, appealDataFullPlanning);
				nock('http://test/')
					.get(`/appeals/1/lpa-questionnaires/${appealDataFullPlanning.lpaQuestionnaireId}`)
					.reply(200, {
						...lpaQuestionnaireDataNotValidated,
						eiaConsultedBodiesDetails: null
					});

				const response = await request.get(
					`${baseUrl}/1/lpa-questionnaire/${appealDataFullPlanning.lpaQuestionnaireId}/environmental-impact-assessment/consulted-bodies-details/change`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain(
					'Change consulted relevant statutory consultees</h1>'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'name="eiaConsultedBodiesDetailsRadio" type="radio" value="yes"'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'name="eiaConsultedBodiesDetailsRadio" type="radio" value="no" checked'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'<textarea class="govuk-textarea" id="eia-consulted-bodies-details" name="eiaConsultedBodiesDetails" rows="3"></textarea>'
				);
				expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
			});

			it('should render the change consulted bodies details page with "Yes" radio option checked, and "test consulted bodies details" populated in the textarea, if eiaConsultedBodiesDetails is "test consulted bodies details"', async () => {
				nock('http://test/').get('/appeals/1').reply(200, appealDataFullPlanning);
				nock('http://test/')
					.get(`/appeals/1/lpa-questionnaires/${appealDataFullPlanning.lpaQuestionnaireId}`)
					.reply(200, {
						...lpaQuestionnaireDataNotValidated,
						eiaConsultedBodiesDetails: 'test consulted bodies details'
					});

				const response = await request.get(
					`${baseUrl}/1/lpa-questionnaire/${appealDataFullPlanning.lpaQuestionnaireId}/environmental-impact-assessment/consulted-bodies-details/change`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain(
					'Change consulted relevant statutory consultees</h1>'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'name="eiaConsultedBodiesDetailsRadio" type="radio" value="yes" checked'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'name="eiaConsultedBodiesDetailsRadio" type="radio" value="no"'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'<textarea class="govuk-textarea" id="eia-consulted-bodies-details" name="eiaConsultedBodiesDetails" rows="3">test consulted bodies details</textarea>'
				);
				expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
			});
		});

		describe('POST /environmental-impact-assessment/consulted-bodies-details/change', () => {
			it('should re-render the change consulted bodies details page with the expected validation error and the "yes" radio option checked, if "yes" was selected but no text was entered in the details textarea', async () => {
				nock('http://test/').get('/appeals/1').reply(200, appealDataFullPlanning);
				nock('http://test/')
					.get(`/appeals/1/lpa-questionnaires/${appealDataFullPlanning.lpaQuestionnaireId}`)
					.reply(200, {
						...lpaQuestionnaireDataNotValidated,
						eiaConsultedBodiesDetails: null
					});

				const response = await request
					.post(
						`${baseUrl}/1/lpa-questionnaire/${appealDataFullPlanning.lpaQuestionnaireId}/environmental-impact-assessment/consulted-bodies-details/change`
					)
					.send({
						eiaConsultedBodiesDetailsRadio: 'yes',
						eiaConsultedBodiesDetails: ''
					});

				expect(response.statusCode).toBe(200);

				const elementInnerHtml = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

				expect(elementInnerHtml).toContain('Change consulted relevant statutory consultees</h1>');
				expect(elementInnerHtml).toContain(
					'name="eiaConsultedBodiesDetailsRadio" type="radio" value="yes" checked'
				);
				expect(elementInnerHtml).toContain(
					'name="eiaConsultedBodiesDetailsRadio" type="radio" value="no"'
				);

				const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
					rootElement: '.govuk-error-summary',
					skipPrettyPrint: true
				}).innerHTML;

				expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
				expect(unprettifiedErrorSummaryHtml).toContain(
					'Enter consulted relevant statutory consultees details</a>'
				);
			});

			it('should re-render the change consulted bodies details page with the expected validation error, and the "yes" radio option checked, and the details textarea pre-populated with the submitted text, if "yes" was selected and the text entered in the details textarea exceeds 1000 characters in length', async () => {
				nock('http://test/').get('/appeals/1').reply(200, appealDataFullPlanning);
				nock('http://test/')
					.get(`/appeals/1/lpa-questionnaires/${appealDataFullPlanning.lpaQuestionnaireId}`)
					.reply(200, {
						...lpaQuestionnaireDataNotValidated,
						eiaConsultedBodiesDetails: null
					});

				const submittedText = 'a'.repeat(1001);

				const response = await request
					.post(
						`${baseUrl}/1/lpa-questionnaire/${appealDataFullPlanning.lpaQuestionnaireId}/environmental-impact-assessment/consulted-bodies-details/change`
					)
					.send({
						eiaConsultedBodiesDetailsRadio: 'yes',
						eiaConsultedBodiesDetails: submittedText
					});

				expect(response.statusCode).toBe(200);

				const elementInnerHtml = parseHtml(response.text, { skipPrettyPrint: true }).innerHTML;

				expect(elementInnerHtml).toContain('Change consulted relevant statutory consultees</h1>');
				expect(elementInnerHtml).toContain(
					'name="eiaConsultedBodiesDetailsRadio" type="radio" value="yes" checked'
				);
				expect(elementInnerHtml).toContain(
					'name="eiaConsultedBodiesDetailsRadio" type="radio" value="no"'
				);
				expect(elementInnerHtml).toContain(`${submittedText}</textarea>`);

				const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
					rootElement: '.govuk-error-summary',
					skipPrettyPrint: true
				}).innerHTML;

				expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
				expect(unprettifiedErrorSummaryHtml).toContain(
					'Consulted relevant statutory consultees details must be 1000 characters or less</a>'
				);
			});

			it('should call LPA questionnaires PATCH endpoint and redirect to the LPA questionnaire page if "no" was selected', async () => {
				const mockLPAQPatchEndpoint = nock('http://test/')
					.patch(`/appeals/1/lpa-questionnaires/${appealDataFullPlanning.lpaQuestionnaireId}`)
					.reply(200, {});

				const response = await request
					.post(
						`${baseUrl}/1/lpa-questionnaire/${appealDataFullPlanning.lpaQuestionnaireId}/environmental-impact-assessment/consulted-bodies-details/change`
					)
					.send({
						eiaConsultedBodiesDetailsRadio: 'no',
						eiaConsultedBodiesDetails: ''
					});

				expect(mockLPAQPatchEndpoint.isDone()).toBe(true);
				expect(response.statusCode).toBe(302);
				expect(response.text).toBe(
					`Found. Redirecting to /appeals-service/appeal-details/1/lpa-questionnaire/${appealDataFullPlanning.lpaQuestionnaireId}`
				);
			});

			it('should call LPA questionnaires PATCH endpoint and redirect to the LPA questionnaire page if "yes" was selected, and the text entered in the details textarea is between 1 and 1000 characters in length', async () => {
				const mockLPAQPatchEndpoint = nock('http://test/')
					.patch(`/appeals/1/lpa-questionnaires/${appealDataFullPlanning.lpaQuestionnaireId}`)
					.reply(200, {});

				const response = await request
					.post(
						`${baseUrl}/1/lpa-questionnaire/${appealDataFullPlanning.lpaQuestionnaireId}/environmental-impact-assessment/consulted-bodies-details/change`
					)
					.send({
						eiaConsultedBodiesDetailsRadio: 'yes',
						eiaConsultedBodiesDetails: 'a'.repeat(1000)
					});

				expect(mockLPAQPatchEndpoint.isDone()).toBe(true);
				expect(response.statusCode).toBe(302);
				expect(response.text).toBe(
					`Found. Redirecting to /appeals-service/appeal-details/1/lpa-questionnaire/${appealDataFullPlanning.lpaQuestionnaireId}`
				);
			});
		});
	});
});
