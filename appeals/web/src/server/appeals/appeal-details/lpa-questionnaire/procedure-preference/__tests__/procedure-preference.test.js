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

describe('procedure-preference', () => {
	beforeEach(() => {
		installMockApi();
		nock('http://test/')
			.get('/appeals/2')
			.reply(200, {
				...appealDataFullPlanning,
				appealId: 2
			})
			.persist();
	});
	afterEach(teardown);

	describe('GET /lpa-questionnaire', () => {
		const testCases = [
			{
				fieldName: 'lpaProcedurePreference',
				validFieldValue: 'hearing',
				labelText: 'Procedure preference',
				validValueText: 'Hearing',
				defaultValueText: 'Not answered'
			},
			{
				fieldName: 'lpaProcedurePreferenceDetails',
				validFieldValue: 'Example reason for preference text',
				labelText: 'Reason for preference',
				validValueText: 'Example reason for preference text',
				defaultValueText: 'Not applicable'
			},
			{
				fieldName: 'lpaProcedurePreferenceDuration',
				validFieldValue: 5,
				labelText: 'Expected length of procedure',
				validValueText: '5 days',
				defaultValueText: 'Not applicable'
			}
		];

		for (const testCase of testCases) {
			describe(`"${testCase.labelText}" row`, () => {
				it(`should render a summary list row for ${testCase.labelText} with "${testCase.defaultValueText}" populated in the value column if ${testCase.fieldName} is not present in the LPA questionnaire`, async () => {
					nock('http://test/')
						.get(`/appeals/2/lpa-questionnaires/${appealDataFullPlanning.lpaQuestionnaireId}`)
						.reply(200, lpaQuestionnaireDataNotValidated);

					const response = await request.get(
						`${baseUrl}/2/lpa-questionnaire/${appealDataFullPlanning.lpaQuestionnaireId}`
					);

					const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

					expect(unprettifiedElement.innerHTML).toContain(
						`<dt class="govuk-summary-list__key"> ${testCase.labelText}</dt><dd class="govuk-summary-list__value"> ${testCase.defaultValueText}</dd>`
					);
				});

				it(`should render a summary list row for ${testCase.labelText} with "${testCase.defaultValueText}" populated in the value column if ${testCase.fieldName} is null`, async () => {
					nock('http://test/')
						.get(`/appeals/2/lpa-questionnaires/${appealDataFullPlanning.lpaQuestionnaireId}`)
						.reply(200, {
							...lpaQuestionnaireDataNotValidated,
							[testCase.fieldName]: null
						});

					const response = await request.get(
						`${baseUrl}/2/lpa-questionnaire/${appealDataFullPlanning.lpaQuestionnaireId}`
					);
					const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

					expect(unprettifiedElement.innerHTML).toContain(
						`<dt class="govuk-summary-list__key"> ${testCase.labelText}</dt><dd class="govuk-summary-list__value"> ${testCase.defaultValueText}</dd>`
					);
				});

				it(`should render a summary list row for ${testCase.labelText} with "${testCase.validValueText}" populated in the value column if ${testCase.fieldName} is "${testCase.validFieldValue}"`, async () => {
					nock('http://test/')
						.get(`/appeals/2/lpa-questionnaires/${appealDataFullPlanning.lpaQuestionnaireId}`)
						.reply(200, {
							...lpaQuestionnaireDataNotValidated,
							[testCase.fieldName]: testCase.validFieldValue
						});

					const response = await request.get(
						`${baseUrl}/2/lpa-questionnaire/${appealDataFullPlanning.lpaQuestionnaireId}`
					);

					const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

					expect(unprettifiedElement.innerHTML).toContain(
						`<dt class="govuk-summary-list__key"> ${testCase.labelText}</dt><dd class="govuk-summary-list__value"> ${testCase.validValueText}</dd>`
					);
				});
			});
		}
	});

	describe('GET /change', () => {
		it('should render the change procedure preference page with the expected content', async () => {
			nock('http://test/')
				.get(`/appeals/2/lpa-questionnaires/${appealDataFullPlanning.lpaQuestionnaireId}`)
				.reply(200, lpaQuestionnaireDataNotValidated);

			const response = await request.get(
				`${baseUrl}/2/lpa-questionnaire/${appealDataFullPlanning.lpaQuestionnaireId}/procedure-preference/change`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Change procedure preference</h1>');
			expect(unprettifiedElement.innerHTML).toContain(
				'name="procedurePreferenceRadio" type="radio" value="hearing">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="procedurePreferenceRadio" type="radio" value="inquiry">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="procedurePreferenceRadio" type="radio" value="written">'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});

		const testCases = [
			{
				value: 'hearing',
				expectedHtml: 'name="procedurePreferenceRadio" type="radio" value="hearing" checked>'
			},
			{
				value: 'inquiry',
				expectedHtml: 'name="procedurePreferenceRadio" type="radio" value="inquiry" checked>'
			},
			{
				value: 'written',
				expectedHtml: 'name="procedurePreferenceRadio" type="radio" value="written" checked>'
			}
		];

		for (const testCase of testCases) {
			it(`should render the change procedure preference page with the expected content if lpaProcedurePreference is "${testCase.value}"`, async () => {
				nock('http://test/')
					.get(`/appeals/2/lpa-questionnaires/${appealDataFullPlanning.lpaQuestionnaireId}`)
					.reply(200, {
						...lpaQuestionnaireDataNotValidated,
						lpaProcedurePreference: testCase.value
					});

				const response = await request.get(
					`${baseUrl}/2/lpa-questionnaire/${appealDataFullPlanning.lpaQuestionnaireId}/procedure-preference/change`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain(testCase.expectedHtml);
			});
		}
	});

	describe('POST /change', () => {
		const validValues = ['hearing', 'inquiry', 'written'];

		for (const validValue of validValues) {
			it(`should call LPA questionnaires PATCH endpoint and redirect to the LPA questionnaire page if "${validValue}" is selected`, async () => {
				const mockPatchEndpoint = nock('http://test/')
					.patch(`/appeals/2/lpa-questionnaires/${appealDataFullPlanning.lpaQuestionnaireId}`)
					.reply(200, {});

				const response = await request
					.post(
						`${baseUrl}/2/lpa-questionnaire/${appealDataFullPlanning.lpaQuestionnaireId}/procedure-preference/change`
					)
					.send({
						procedurePreferenceRadio: validValue
					});

				expect(mockPatchEndpoint.isDone()).toBe(true);
				expect(response.statusCode).toBe(302);
				expect(response.text).toBe(
					`Found. Redirecting to /appeals-service/appeal-details/2/lpa-questionnaire/${appealDataFullPlanning.lpaQuestionnaireId}`
				);
			});
		}
	});

	describe('GET /details/change', () => {
		it('should render the change reason for preference page with "procedurePreferenceDetailsTextarea" textarea unpopulated if lpaProcedurePreferenceDetails is not populated in the LPA questionnaire data', async () => {
			nock('http://test/')
				.get(`/appeals/2/lpa-questionnaires/${appealDataFullPlanning.lpaQuestionnaireId}`)
				.reply(200, lpaQuestionnaireDataNotValidated);

			const response = await request.get(
				`${baseUrl}/2/lpa-questionnaire/${appealDataFullPlanning.lpaQuestionnaireId}/procedure-preference/details/change`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Change reason for preference</h1>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<textarea class="govuk-textarea" id="procedure-preference-details" name="procedurePreferenceDetailsTextarea" rows="5"></textarea>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});

		it('should render the change reason for preference page with "procedurePreferenceDetailsTextarea" textarea populated with the expected content if lpaProcedurePreferenceDetails is populated in the LPA questionnaire data', async () => {
			nock('http://test/')
				.get(`/appeals/2/lpa-questionnaires/${appealDataFullPlanning.lpaQuestionnaireId}`)
				.reply(200, {
					...lpaQuestionnaireDataNotValidated,
					lpaProcedurePreferenceDetails: 'Example procedure preference details text'
				});

			const response = await request.get(
				`${baseUrl}/2/lpa-questionnaire/${appealDataFullPlanning.lpaQuestionnaireId}/procedure-preference/details/change`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'<textarea class="govuk-textarea" id="procedure-preference-details" name="procedurePreferenceDetailsTextarea" rows="5">Example procedure preference details text</textarea>'
			);
		});
	});

	describe('POST /details/change', () => {
		const testText1000Characters = 'a'.repeat(1000);
		const testText1001Characters = 'a'.repeat(1001);

		it('should re-render the change reason for preference page with the expected error message if "procedurePreferenceDetailsTextarea" textarea contains more than 1000 characters', async () => {
			nock('http://test/')
				.get(`/appeals/2/lpa-questionnaires/${appealDataFullPlanning.lpaQuestionnaireId}`)
				.reply(200, lpaQuestionnaireDataNotValidated);

			const response = await request
				.post(
					`${baseUrl}/2/lpa-questionnaire/${appealDataFullPlanning.lpaQuestionnaireId}/procedure-preference/duration/change`
				)
				.send({
					procedurePreferenceDetailsTextarea: testText1001Characters
				});

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain(
				'Provide the expected length of procedure</a>'
			);
		});

		const validValues = [testText1000Characters, ''];

		for (const validValue of validValues) {
			it(`should call LPA questionnaires PATCH endpoint and redirect to the LPA questionnaire page if "procedurePreferenceDetailsTextarea" textarea is ${
				validValue.length ? 'populated with a valid value' : 'empty'
			}`, async () => {
				const mockPatchEndpoint = nock('http://test/')
					.patch(`/appeals/2/lpa-questionnaires/${appealDataFullPlanning.lpaQuestionnaireId}`)
					.reply(200, {});

				const response = await request
					.post(
						`${baseUrl}/2/lpa-questionnaire/${appealDataFullPlanning.lpaQuestionnaireId}/procedure-preference/details/change`
					)
					.send({
						procedurePreferenceDetailsTextarea: validValue
					});

				expect(mockPatchEndpoint.isDone()).toBe(true);
				expect(response.statusCode).toBe(302);
				expect(response.text).toBe(
					`Found. Redirecting to /appeals-service/appeal-details/2/lpa-questionnaire/${appealDataFullPlanning.lpaQuestionnaireId}`
				);
			});
		}
	});

	describe('GET /duration/change', () => {
		it('should render the change expected length of procedure page with "procedurePreferenceDurationInput" text input unpopulated if lpaProcedurePreferenceDuration is not populated in the LPA questionnaire data', async () => {
			nock('http://test/')
				.get(`/appeals/2/lpa-questionnaires/${appealDataFullPlanning.lpaQuestionnaireId}`)
				.reply(200, lpaQuestionnaireDataNotValidated);

			const response = await request.get(
				`${baseUrl}/2/lpa-questionnaire/${appealDataFullPlanning.lpaQuestionnaireId}/procedure-preference/duration/change`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Change expected length of procedure</h1>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<input class="govuk-input govuk-input--width-2" id="procedure-preference-duration" name="procedurePreferenceDurationInput" type="text">'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});

		it('should render the change expected length of procedure page with "procedurePreferenceDurationInput" text input populated if lpaProcedurePreferenceDuration is populated in the LPA questionnaire data', async () => {
			nock('http://test/')
				.get(`/appeals/2/lpa-questionnaires/${appealDataFullPlanning.lpaQuestionnaireId}`)
				.reply(200, {
					...lpaQuestionnaireDataNotValidated,
					lpaProcedurePreferenceDuration: 5
				});

			const response = await request.get(
				`${baseUrl}/2/lpa-questionnaire/${appealDataFullPlanning.lpaQuestionnaireId}/procedure-preference/duration/change`
			);

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'<input class="govuk-input govuk-input--width-2" id="procedure-preference-duration" name="procedurePreferenceDurationInput" type="text" value="5">'
			);
		});
	});

	describe('POST /duration/change', () => {
		beforeEach(() => {
			nock('http://test/')
				.get(`/appeals/2/lpa-questionnaires/${appealDataFullPlanning.lpaQuestionnaireId}`)
				.reply(200, lpaQuestionnaireDataNotValidated);
		});

		const testCases = [
			{
				label: 'empty',
				value: '',
				expectedErrorMessage: 'Provide the expected length of procedure'
			},
			{
				label: 'non-numeric',
				value: 'a',
				expectedErrorMessage: 'Expected length of procedure must be a number'
			},
			{
				label: 'less than 0',
				value: '-1',
				expectedErrorMessage: 'Expected length of procedure must be a number between 0 and 9'
			},
			{
				label: 'greater than 9',
				value: '10',
				expectedErrorMessage: 'Expected length of procedure must be a number between 0 and 9'
			}
		];

		for (const testCase of testCases) {
			it(`should re-render the change expected length of procedure page with the expected error message if "procedurePreferenceDurationInput" text input is ${testCase.label}`, async () => {
				const response = await request
					.post(
						`${baseUrl}/2/lpa-questionnaire/${appealDataFullPlanning.lpaQuestionnaireId}/procedure-preference/duration/change`
					)
					.send({
						procedurePreferenceDurationInput: testCase.value
					});

				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
					rootElement: '.govuk-error-summary',
					skipPrettyPrint: true
				}).innerHTML;

				expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
				expect(unprettifiedErrorSummaryHtml).toContain(`${testCase.expectedErrorMessage}</a>`);
			});
		}

		it('should call lpa-questionnaires PATCH endpoint and redirect to the LPA questionnaire page if "procedurePreferenceDurationInput" text input is populated with a valid value', async () => {
			const mockPatchEndpoint = nock('http://test/')
				.patch(`/appeals/2/lpa-questionnaires/${appealDataFullPlanning.lpaQuestionnaireId}`)
				.reply(200, {});

			const response = await request
				.post(
					`${baseUrl}/2/lpa-questionnaire/${appealDataFullPlanning.lpaQuestionnaireId}/procedure-preference/duration/change`
				)
				.send({
					procedurePreferenceDurationInput: 1
				});

			expect(mockPatchEndpoint.isDone()).toBe(true);
			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				`Found. Redirecting to /appeals-service/appeal-details/2/lpa-questionnaire/${appealDataFullPlanning.lpaQuestionnaireId}`
			);
		});
	});
});