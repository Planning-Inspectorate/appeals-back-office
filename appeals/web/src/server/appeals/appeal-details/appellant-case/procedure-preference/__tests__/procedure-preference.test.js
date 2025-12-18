// @ts-nocheck
import {
	appealDataFullPlanning,
	appellantCaseDataNotValidated
} from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';

describe('procedure-preference', () => {
	beforeEach(() => {
		installMockApi();
		nock('http://test/')
			.get('/appeals/2?include=all')
			.reply(200, {
				...appealDataFullPlanning,
				appealId: 2
			})
			.persist();
	});
	afterEach(teardown);

	describe('GET /appellant-case', () => {
		const testCases = [
			{
				fieldName: 'appellantProcedurePreference',
				validFieldValue: 'hearing',
				labelText: 'How would you prefer us to decide your appeal?',
				validValueText: 'Hearing',
				defaultValueText: 'Not answered'
			},
			{
				fieldName: 'appellantProcedurePreferenceDetails',
				validFieldValue: 'Example reason for preference text',
				labelText: 'Why would you prefer this appeal procedure?',
				validValueText: 'Example reason for preference text',
				defaultValueText: 'Not answered'
			},
			{
				fieldName: 'appellantProcedurePreferenceDuration',
				validFieldValue: 5,
				labelText: 'How many days would you expect the inquiry to last?',
				validValueText: '5 days',
				defaultValueText: 'Not answered'
			},
			{
				fieldName: 'appellantProcedurePreferenceWitnessCount',
				validFieldValue: 3,
				labelText: 'How many witnesses would you expect to give evidence at the inquiry?',
				validValueText: '3',
				defaultValueText: 'Not answered'
			}
		];

		for (const testCase of testCases) {
			describe(`"${testCase.labelText}" row`, () => {
				it(`should render a summary list row for ${testCase.labelText} with "${testCase.defaultValueText}" populated in the value column if ${testCase.fieldName} is not present in the appellant case`, async () => {
					nock('http://test/')
						.get(`/appeals/2/appellant-cases/${appealDataFullPlanning.appellantCaseId}`)
						.reply(200, appellantCaseDataNotValidated);

					const response = await request.get(`${baseUrl}/2/appellant-case`);

					const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

					expect(unprettifiedElement.innerHTML).toContain(
						`<dt class="govuk-summary-list__key"> ${testCase.labelText}</dt><dd class="govuk-summary-list__value"> ${testCase.defaultValueText}</dd>`
					);
				});

				it(`should render a summary list row for ${testCase.labelText} with "${testCase.defaultValueText}" populated in the value column if ${testCase.fieldName} is null`, async () => {
					nock('http://test/')
						.get(`/appeals/2/appellant-cases/${appealDataFullPlanning.appellantCaseId}`)
						.reply(200, {
							...appellantCaseDataNotValidated,
							[testCase.fieldName]: null
						});

					const response = await request.get(`${baseUrl}/2/appellant-case`);
					const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

					expect(unprettifiedElement.innerHTML).toContain(
						`<dt class="govuk-summary-list__key"> ${testCase.labelText}</dt><dd class="govuk-summary-list__value"> ${testCase.defaultValueText}</dd>`
					);
				});

				it(`should render a summary list row for ${testCase.labelText} with "${testCase.validValueText}" populated in the value column if ${testCase.fieldName} is "${testCase.validFieldValue}"`, async () => {
					nock('http://test/')
						.get(`/appeals/2/appellant-cases/${appealDataFullPlanning.appellantCaseId}`)
						.reply(200, {
							...appellantCaseDataNotValidated,
							[testCase.fieldName]: testCase.validFieldValue
						});

					const response = await request.get(`${baseUrl}/2/appellant-case`);

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
				.get(`/appeals/2/appellant-cases/${appealDataFullPlanning.appellantCaseId}`)
				.reply(200, appellantCaseDataNotValidated);

			const response = await request.get(`${baseUrl}/2/appellant-case/procedure-preference/change`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'How would you prefer us to decide your appeal?</h1>'
			);
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
			it(`should render the change procedure preference page with the expected content if appellantProcedurePreference is "${testCase.value}"`, async () => {
				nock('http://test/')
					.get(`/appeals/2/appellant-cases/${appealDataFullPlanning.appellantCaseId}`)
					.reply(200, {
						...appellantCaseDataNotValidated,
						appellantProcedurePreference: testCase.value
					});

				const response = await request.get(
					`${baseUrl}/2/appellant-case/procedure-preference/change`
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
			it(`should call appellant cases PATCH endpoint and redirect to the appellant case page if "${validValue}" is selected`, async () => {
				const mockPatchEndpoint = nock('http://test/')
					.patch(`/appeals/2/appellant-cases/${appealDataFullPlanning.appellantCaseId}`)
					.reply(200, {});

				const response = await request
					.post(`${baseUrl}/2/appellant-case/procedure-preference/change`)
					.send({
						procedurePreferenceRadio: validValue
					});

				expect(mockPatchEndpoint.isDone()).toBe(true);
				expect(response.statusCode).toBe(302);
				expect(response.text).toBe(
					`Found. Redirecting to /appeals-service/appeal-details/2/appellant-case`
				);
			});
		}
	});

	describe('GET /details/change', () => {
		it('should render the change reason for preference page with "procedurePreferenceDetailsTextarea" textarea unpopulated if appellantProcedurePreferenceDetails is not populated in the appellant case data', async () => {
			nock('http://test/')
				.get(`/appeals/2/appellant-cases/${appealDataFullPlanning.appellantCaseId}`)
				.reply(200, appellantCaseDataNotValidated);

			const response = await request.get(
				`${baseUrl}/2/appellant-case/procedure-preference/details/change`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'Why would you prefer this appeal procedure?</label></h1>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'<textarea class="govuk-textarea" id="procedure-preference-details-textarea" name="procedurePreferenceDetailsTextarea" rows="5"></textarea>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});

		it('should render the change reason for preference page with "procedurePreferenceDetailsTextarea" textarea populated with the expected content if appellantProcedurePreferenceDetails is populated in the appellant case data', async () => {
			nock('http://test/')
				.get(`/appeals/2/appellant-cases/${appealDataFullPlanning.appellantCaseId}`)
				.reply(200, {
					...appellantCaseDataNotValidated,
					appellantProcedurePreferenceDetails: 'Example procedure preference details text'
				});

			const response = await request.get(
				`${baseUrl}/2/appellant-case/procedure-preference/details/change`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'<textarea class="govuk-textarea" id="procedure-preference-details-textarea" name="procedurePreferenceDetailsTextarea" rows="5">Example procedure preference details text</textarea>'
			);
		});
	});

	describe('POST /details/change', () => {
		const testText1000Characters = 'a'.repeat(1000);
		const testText1001Characters = 'a'.repeat(1001);

		it('should re-render the change reason for preference page with the expected error message if "procedurePreferenceDetailsTextarea" textarea contains more than 1000 characters', async () => {
			nock('http://test/')
				.get(`/appeals/2/appellant-cases/${appealDataFullPlanning.appellantCaseId}`)
				.reply(200, appellantCaseDataNotValidated);

			const response = await request
				.post(`${baseUrl}/2/appellant-case/procedure-preference/duration/change`)
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
			expect(unprettifiedErrorSummaryHtml).toContain('Enter the expected length of procedure</a>');
		});

		const validValues = [testText1000Characters, ''];

		for (const validValue of validValues) {
			it(`should call appellant cases PATCH endpoint and redirect to the appellant case page if "procedurePreferenceDetailsTextarea" textarea is ${
				validValue.length ? 'populated with a valid value' : 'empty'
			}`, async () => {
				const mockAppellantCasesPatchEndpoint = nock('http://test/')
					.patch(`/appeals/2/appellant-cases/${appealDataFullPlanning.appellantCaseId}`)
					.reply(200, {});

				const response = await request
					.post(`${baseUrl}/2/appellant-case/procedure-preference/details/change`)
					.send({
						procedurePreferenceDetailsTextarea: validValue
					});

				expect(mockAppellantCasesPatchEndpoint.isDone()).toBe(true);
				expect(response.statusCode).toBe(302);
				expect(response.text).toBe(
					`Found. Redirecting to /appeals-service/appeal-details/2/appellant-case`
				);
			});
		}
	});

	describe('GET /duration/change', () => {
		it('should render the change expected length of procedure page with "procedurePreferenceDurationInput" text input unpopulated if appellantProcedurePreferenceDuration is not populated in the appellant case data', async () => {
			nock('http://test/')
				.get(`/appeals/2/appellant-cases/${appealDataFullPlanning.appellantCaseId}`)
				.reply(200, appellantCaseDataNotValidated);

			const response = await request.get(
				`${baseUrl}/2/appellant-case/procedure-preference/duration/change`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'How many days would you expect the inquiry to last?</label></h1>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'<input class="govuk-input govuk-input--width-2" id="procedure-preference-duration" name="procedurePreferenceDurationInput" type="text" value="">'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});

		it('should render the change expected length of procedure page with "procedurePreferenceDurationInput" text input populated if appellantProcedurePreferenceDuration is populated in the appellant case data', async () => {
			nock('http://test/')
				.get(`/appeals/2/appellant-cases/${appealDataFullPlanning.appellantCaseId}`)
				.reply(200, {
					...appellantCaseDataNotValidated,
					appellantProcedurePreferenceDuration: 5
				});

			const response = await request.get(
				`${baseUrl}/2/appellant-case/procedure-preference/duration/change`
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
				.get(`/appeals/2/appellant-cases/${appealDataFullPlanning.appellantCaseId}`)
				.reply(200, appellantCaseDataNotValidated);
		});

		const testCases = [
			{
				label: 'empty',
				value: '',
				expectedErrorMessage: 'Enter the expected length of procedure'
			},
			{
				label: 'non-numeric',
				value: 'a',
				expectedErrorMessage: 'Expected length of procedure must be a number'
			},
			{
				label: 'less than 0',
				value: '-1',
				expectedErrorMessage: 'Expected length of procedure must be a number between 0 and 99'
			},
			{
				label: 'greater than 99',
				value: '100',
				expectedErrorMessage: 'Expected length of procedure must be a number between 0 and 99'
			}
		];

		for (const testCase of testCases) {
			it(`should re-render the change expected length of procedure page with the expected error message if "procedurePreferenceDurationInput" text input is ${testCase.label}`, async () => {
				const response = await request
					.post(`${baseUrl}/2/appellant-case/procedure-preference/duration/change`)
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

		it('should call appellant cases PATCH endpoint and redirect to the appellant case page if "procedurePreferenceDurationInput" text input is populated with a valid value', async () => {
			const mockAppellantCasesPatchEndpoint = nock('http://test/')
				.patch(`/appeals/2/appellant-cases/${appealDataFullPlanning.appellantCaseId}`)
				.reply(200, {});

			const response = await request
				.post(`${baseUrl}/2/appellant-case/procedure-preference/duration/change`)
				.send({
					procedurePreferenceDurationInput: 1
				});

			expect(mockAppellantCasesPatchEndpoint.isDone()).toBe(true);
			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				`Found. Redirecting to /appeals-service/appeal-details/2/appellant-case`
			);
		});
	});

	describe('GET /inquiry/witnesses/change', () => {
		it('should render the change expected number of witnesses page with "inquiryNumberOfWitnessesInput" text input unpopulated if appellantProcedurePreferenceWitnessCount is not populated in the appellant case data', async () => {
			nock('http://test/')
				.get(`/appeals/2/appellant-cases/${appealDataFullPlanning.appellantCaseId}`)
				.reply(200, appellantCaseDataNotValidated);

			const response = await request.get(
				`${baseUrl}/2/appellant-case/procedure-preference/inquiry/witnesses/change`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'How many witnesses would you expect to give evidence at the inquiry?</label></h1>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'<input class="govuk-input govuk-input--width-2" id="inquiry-number-of-witnesses" name="inquiryNumberOfWitnessesInput" type="text" value="">'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});

		it('should render the change expected number of witnesses page with "inquiryNumberOfWitnessesInput" text input populated if appellantProcedurePreferenceWitnessCount is populated in the appellant case data', async () => {
			nock('http://test/')
				.get(`/appeals/2/appellant-cases/${appealDataFullPlanning.appellantCaseId}`)
				.reply(200, {
					...appellantCaseDataNotValidated,
					appellantProcedurePreferenceWitnessCount: 5
				});

			const response = await request.get(
				`${baseUrl}/2/appellant-case/procedure-preference/inquiry/witnesses/change`
			);

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'<input class="govuk-input govuk-input--width-2" id="inquiry-number-of-witnesses" name="inquiryNumberOfWitnessesInput" type="text" value="5">'
			);
		});
	});

	describe('POST /inquiry/witnesses/change', () => {
		beforeEach(() => {
			nock('http://test/')
				.get(`/appeals/2/appellant-cases/${appealDataFullPlanning.appellantCaseId}`)
				.reply(200, appellantCaseDataNotValidated);
		});

		const testCases = [
			{
				label: 'empty',
				value: '',
				expectedErrorMessage: 'Enter the expected number of witnesses'
			},
			{
				label: 'non-numeric',
				value: 'a',
				expectedErrorMessage: 'Expected number of witnesses must be a number'
			},
			{
				label: 'less than 0',
				value: '-1',
				expectedErrorMessage: 'Expected number of witnesses must be a number between 0 and 99'
			},
			{
				label: 'greater than 99',
				value: '100',
				expectedErrorMessage: 'Expected number of witnesses must be a number between 0 and 99'
			}
		];

		for (const testCase of testCases) {
			it(`should re-render the change expected number of witnesses page with the expected error message if "inquiryNumberOfWitnessesInput" text input is ${testCase.label}`, async () => {
				const response = await request
					.post(`${baseUrl}/2/appellant-case/procedure-preference/inquiry/witnesses/change`)
					.send({
						inquiryNumberOfWitnessesInput: testCase.value
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

		it('should call appellant cases PATCH endpoint and redirect to the appellant case page if "inquiryNumberOfWitnessesInput" text input is populated with a valid value', async () => {
			const mockAppellantCasesPatchEndpoint = nock('http://test/')
				.patch(`/appeals/2/appellant-cases/${appealDataFullPlanning.appellantCaseId}`)
				.reply(200, {});

			const response = await request
				.post(`${baseUrl}/2/appellant-case/procedure-preference/inquiry/witnesses/change`)
				.send({
					inquiryNumberOfWitnessesInput: 1
				});

			expect(mockAppellantCasesPatchEndpoint.isDone()).toBe(true);
			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				`Found. Redirecting to /appeals-service/appeal-details/2/appellant-case`
			);
		});
	});
});
