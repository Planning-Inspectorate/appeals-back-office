// @ts-nocheck
import { parseHtml } from '@pins/platform';
import supertest from 'supertest';
import {
	appealDataFullPlanning,
	appellantCaseDataNotValidated
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

	describe('GET /appellant-case', () => {
		it('should render a summary list row for preferred procedure with "Not answered" populated in the value column if appellantProcedurePreference is not present in the appellant case', async () => {
			nock('http://test/')
				.get(`/appeals/2/appellant-cases/${appealDataFullPlanning.appellantCaseId}`)
				.reply(200, appellantCaseDataNotValidated);

			const response = await request.get(`${baseUrl}/2/appellant-case`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'<dt class="govuk-summary-list__key"> Procedure preference</dt><dd class="govuk-summary-list__value"> Not answered</dd>'
			);
		});

		it('should render a summary list row for preferred procedure with "Not answered" populated in the value column if appellantProcedurePreference is null', async () => {
			nock('http://test/')
				.get(`/appeals/2/appellant-cases/${appealDataFullPlanning.appellantCaseId}`)
				.reply(200, {
					...appellantCaseDataNotValidated,
					appellantProcedurePreference: null
				});

			const response = await request.get(`${baseUrl}/2/appellant-case`);
			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'<dt class="govuk-summary-list__key"> Procedure preference</dt><dd class="govuk-summary-list__value"> Not answered</dd>'
			);
		});

		it('should render a summary list row for preferred procedure with appellantProcedurePreference populated in the value column if appellantProcedurePreference is present in the appellant case', async () => {
			nock('http://test/')
				.get(`/appeals/2/appellant-cases/${appealDataFullPlanning.appellantCaseId}`)
				.reply(200, {
					...appellantCaseDataNotValidated,
					appellantProcedurePreference: 'hearing'
				});

			const response = await request.get(`${baseUrl}/2/appellant-case`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'<dt class="govuk-summary-list__key"> Procedure preference</dt><dd class="govuk-summary-list__value"> Hearing</dd>'
			);
		});

		it('should render a summary list row for reason for preference with "Not applicable" populated in the value column if appellantProcedurePreferenceDetails is not present in the appellant case', async () => {
			nock('http://test/')
				.get(`/appeals/2/appellant-cases/${appealDataFullPlanning.appellantCaseId}`)
				.reply(200, appellantCaseDataNotValidated);

			const response = await request.get(`${baseUrl}/2/appellant-case`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'<dt class="govuk-summary-list__key"> Reason for preference</dt><dd class="govuk-summary-list__value"> Not applicable</dd>'
			);
		});

		it('should render a summary list row for reason for preference with "Not applicable" populated in the value column if appellantProcedurePreferenceDetails is null', async () => {
			nock('http://test/')
				.get(`/appeals/2/appellant-cases/${appealDataFullPlanning.appellantCaseId}`)
				.reply(200, {
					...appellantCaseDataNotValidated,
					appellantProcedurePreferenceDetails: null
				});

			const response = await request.get(`${baseUrl}/2/appellant-case`);
			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'<dt class="govuk-summary-list__key"> Reason for preference</dt><dd class="govuk-summary-list__value"> Not applicable</dd>'
			);
		});

		it('should render a summary list row for reason for preference with appellantProcedurePreferenceDetails populated in the value column if appellantProcedurePreferenceDetails is present in the appellant case', async () => {
			nock('http://test/')
				.get(`/appeals/2/appellant-cases/${appealDataFullPlanning.appellantCaseId}`)
				.reply(200, {
					...appellantCaseDataNotValidated,
					appellantProcedurePreferenceDetails: 'Lorem ipsum'
				});

			const response = await request.get(`${baseUrl}/2/appellant-case`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'<dt class="govuk-summary-list__key"> Reason for preference</dt><dd class="govuk-summary-list__value"> Lorem ipsum</dd>'
			);
		});

		it('should render a summary list row for expected length of procedure with "Not applicable" populated in the value column if appellantProcedurePreferenceDuration is not present in the appellant case', async () => {
			nock('http://test/')
				.get(`/appeals/2/appellant-cases/${appealDataFullPlanning.appellantCaseId}`)
				.reply(200, appellantCaseDataNotValidated);

			const response = await request.get(`${baseUrl}/2/appellant-case`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'<dt class="govuk-summary-list__key"> Expected length of procedure</dt><dd class="govuk-summary-list__value"> Not applicable</dd>'
			);
		});

		it('should render a summary list row for expected length of procedure with "Not applicable" populated in the value column if appellantProcedurePreferenceDuration null', async () => {
			nock('http://test/')
				.get(`/appeals/2/appellant-cases/${appealDataFullPlanning.appellantCaseId}`)
				.reply(200, {
					...appellantCaseDataNotValidated,
					appellantProcedurePreferenceDuration: null
				});

			const response = await request.get(`${baseUrl}/2/appellant-case`);
			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'<dt class="govuk-summary-list__key"> Expected length of procedure</dt><dd class="govuk-summary-list__value"> Not applicable</dd>'
			);
		});

		it('should render a summary list row for expected length of procedure with appellantProcedurePreferenceDuration populated in the value column if appellantProcedurePreferenceDuration is present in the appellant case', async () => {
			nock('http://test/')
				.get(`/appeals/2/appellant-cases/${appealDataFullPlanning.appellantCaseId}`)
				.reply(200, {
					...appellantCaseDataNotValidated,
					appellantProcedurePreferenceDuration: 5
				});

			const response = await request.get(`${baseUrl}/2/appellant-case`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'<dt class="govuk-summary-list__key"> Expected length of procedure</dt><dd class="govuk-summary-list__value"> 5 days</dd>'
			);
		});

		it('should render a summary list row for expected number of witnesses with "Not applicable" populated in the value column if inquiryHowManyWitnesses is not present in the appellant case', async () => {
			nock('http://test/')
				.get(`/appeals/2/appellant-cases/${appealDataFullPlanning.appellantCaseId}`)
				.reply(200, appellantCaseDataNotValidated);

			const response = await request.get(`${baseUrl}/2/appellant-case`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'<dt class="govuk-summary-list__key"> Expected number of witnesses</dt><dd class="govuk-summary-list__value"> Not applicable</dd>'
			);
		});

		it('should render a summary list row for expected number of witnesses with "Not applicable" populated in the value column if inquiryHowManyWitnesses is null', async () => {
			nock('http://test/')
				.get(`/appeals/2/appellant-cases/${appealDataFullPlanning.appellantCaseId}`)
				.reply(200, {
					...appellantCaseDataNotValidated,
					inquiryHowManyWitnesses: null
				});

			const response = await request.get(`${baseUrl}/2/appellant-case`);
			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'<dt class="govuk-summary-list__key"> Expected number of witnesses</dt><dd class="govuk-summary-list__value"> Not applicable</dd>'
			);
		});

		it('should render a summary list row for expected number of witnesses with inquiryHowManyWitnesses populated in the value column if inquiryHowManyWitnesses is present in the appellant case', async () => {
			nock('http://test/')
				.get(`/appeals/2/appellant-cases/${appealDataFullPlanning.appellantCaseId}`)
				.reply(200, {
					...appellantCaseDataNotValidated,
					inquiryHowManyWitnesses: 3
				});

			const response = await request.get(`${baseUrl}/2/appellant-case`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'<dt class="govuk-summary-list__key"> Expected number of witnesses</dt><dd class="govuk-summary-list__value"> 3</dd>'
			);
		});
	});

	describe('GET /change', () => {
		it('should render the change procedure preference page with "Hearing" radio option checked if appellantProcedurePreference is "Hearing"', async () => {
			nock('http://test/')
				.get(`/appeals/2/appellant-cases/${appealDataFullPlanning.appellantCaseId}`)
				.reply(200, {
					...appellantCaseDataNotValidated,
					appellantProcedurePreference: 'hearing'
				});

			const response = await request.get(`${baseUrl}/2/appellant-case/procedure-preference/change`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Change procedure preference</h1>');
			expect(unprettifiedElement.innerHTML).toContain(
				'name="procedurePreferenceRadio" type="radio" value="hearing" checked>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="procedurePreferenceRadio" type="radio" value="inquiry">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="procedurePreferenceRadio" type="radio" value="written">'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});

		it('should render the change procedure preference page with "inquiry" radio option checked if appellantProcedurePreference is "inquiry"', async () => {
			nock('http://test/')
				.get(`/appeals/2/appellant-cases/${appealDataFullPlanning.appellantCaseId}`)
				.reply(200, {
					...appellantCaseDataNotValidated,
					appellantProcedurePreference: 'inquiry'
				});

			const response = await request.get(`${baseUrl}/2/appellant-case/procedure-preference/change`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Change procedure preference</h1>');
			expect(unprettifiedElement.innerHTML).toContain(
				'name="procedurePreferenceRadio" type="radio" value="hearing">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="procedurePreferenceRadio" type="radio" value="inquiry" checked>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="procedurePreferenceRadio" type="radio" value="written">'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});

		it('should render the change procedure preference page with "written" radio option checked if appellantProcedurePreference is "written"', async () => {
			nock('http://test/')
				.get(`/appeals/2/appellant-cases/${appealDataFullPlanning.appellantCaseId}`)
				.reply(200, {
					...appellantCaseDataNotValidated,
					appellantProcedurePreference: 'written'
				});

			const response = await request.get(`${baseUrl}/2/appellant-case/procedure-preference/change`);
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
				'name="procedurePreferenceRadio" type="radio" value="written" checked>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});
	});

	describe('POST /change', () => {
		const validValues = ['hearing', 'inquiry', 'written'];

		for (const validValue of validValues) {
			it(`should call appellant cases PATCH endpoint and redirect to the appellant case page if "${validValue}" is selected`, async () => {
				const mockAppellantCasesPatchEndpoint = nock('http://test/')
					.patch(`/appeals/2/appellant-cases/${appealDataFullPlanning.appellantCaseId}`)
					.reply(200, {});

				const response = await request
					.post(`${baseUrl}/2/appellant-case/procedure-preference/change`)
					.send({
						procedurePreferenceRadio: validValue
					});

				expect(mockAppellantCasesPatchEndpoint.isDone()).toBe(true);
				expect(response.statusCode).toBe(302);
				expect(response.text).toBe(
					'Found. Redirecting to /appeals-service/appeal-details/2/appellant-case'
				);
			});
		}
	});

	describe('GET /details/change', () => {
		it('should render the change reason for preference page with "procedurePreferenceDetailsTextarea" textarea populated with the current preference details if appellantProcedurePreferenceDetails is populated in the appellant case data', async () => {
			nock('http://test/')
				.get(`/appeals/2/appellant-cases/${appealDataFullPlanning.appellantCaseId}`)
				.reply(200, {
					...appellantCaseDataNotValidated,
					appellantProcedurePreferenceDetails: 'Lorem ipsum'
				});

			const response = await request.get(
				`${baseUrl}/2/appellant-case/procedure-preference/details/change`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Change reason for preference</h1>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<textarea class="govuk-textarea" id="procedure-preference-details-textarea" name="procedurePreferenceDetailsTextarea" rows="5">Lorem ipsum</textarea>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});

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

			expect(unprettifiedElement.innerHTML).toContain('Change reason for preference</h1>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<textarea class="govuk-textarea" id="procedure-preference-details-textarea" name="procedurePreferenceDetailsTextarea" rows="5"></textarea>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});
	});

	describe('POST /details/change', () => {
		const testText1000Characters = 'a'.repeat(1000);
		const testText1001Characters = 'a'.repeat(1001);

		it(`should re-render the change reason for preference page with the expected error message if "procedurePreferenceDetailsTextarea" textarea contains more than 1000 characters`, async () => {
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
			expect(unprettifiedErrorSummaryHtml).toContain(
				'Provide the expected length of procedure</a>'
			);
		});

		const validValues = [testText1000Characters, ''];

		for (const validValue of validValues) {
			it(`should call appellant cases PATCH endpoint and redirect to the appellant case page if "procedurePreferenceDetailsTextarea" textarea is ${
				validValue.length ? `populated with a valid value` : 'empty'
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
					'Found. Redirecting to /appeals-service/appeal-details/2/appellant-case'
				);
			});
		}
	});

	describe('GET /duration/change', () => {
		it('should render the change expected length of procedure page with "procedurePreferenceDurationInput" text input populated with the current procedure duration if appellantProcedurePreferenceDuration is populated in the appellant case data', async () => {
			nock('http://test/')
				.get(`/appeals/2/appellant-cases/${appealDataFullPlanning.appellantCaseId}`)
				.reply(200, {
					...appellantCaseDataNotValidated,
					appellantProcedurePreferenceDuration: 5
				});

			const response = await request.get(
				`${baseUrl}/2/appellant-case/procedure-preference/duration/change`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Change expected length of procedure</h1>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<input class="govuk-input govuk-input--width-2" id="procedure-preference-duration" name="procedurePreferenceDurationInput" type="text" value="5">'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});

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

			expect(unprettifiedElement.innerHTML).toContain('Change expected length of procedure</h1>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<input class="govuk-input govuk-input--width-2" id="procedure-preference-duration" name="procedurePreferenceDurationInput" type="text">'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});
	});

	describe('POST /duration/change', () => {
		beforeEach(() => {
			nock('http://test/')
				.get(`/appeals/2/appellant-cases/${appealDataFullPlanning.appellantCaseId}`)
				.reply(200, appellantCaseDataNotValidated);
		});

		it(`should re-render the change expected length of procedure page with the expected error message if "procedurePreferenceDurationInput" text input is empty`, async () => {
			const response = await request
				.post(`${baseUrl}/2/appellant-case/procedure-preference/duration/change`)
				.send({
					procedurePreferenceDurationInput: ''
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

		it(`should re-render the change expected length of procedure page with the expected error message if "procedurePreferenceDurationInput" text input is not numeric`, async () => {
			const response = await request
				.post(`${baseUrl}/2/appellant-case/procedure-preference/duration/change`)
				.send({
					procedurePreferenceDurationInput: 'a'
				});

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain(
				'Expected length of procedure must be a number</a>'
			);
		});

		it(`should re-render the change expected length of procedure page with the expected error message if "procedurePreferenceDurationInput" text input is outside the range 0 - 9`, async () => {
			const response = await request
				.post(`${baseUrl}/2/appellant-case/procedure-preference/duration/change`)
				.send({
					procedurePreferenceDurationInput: '10'
				});

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain(
				'Expected length of procedure must be a number between 0 and 9</a>'
			);
		});

		it(`should call appellant cases PATCH endpoint and redirect to the appellant case page if "procedurePreferenceDurationInput" text input is populated with a valid value`, async () => {
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
				'Found. Redirecting to /appeals-service/appeal-details/2/appellant-case'
			);
		});
	});

	describe('GET /inquiry/witnesses/change', () => {
		it('should render the change expected number of witnesses page with "inquiryNumberOfWitnessesInput" text input populated with the current procedure duration if inquiryHowManyWitnesses is populated in the appellant case data', async () => {
			nock('http://test/')
				.get(`/appeals/2/appellant-cases/${appealDataFullPlanning.appellantCaseId}`)
				.reply(200, {
					...appellantCaseDataNotValidated,
					inquiryHowManyWitnesses: 5
				});

			const response = await request.get(
				`${baseUrl}/2/appellant-case/procedure-preference/inquiry/witnesses/change`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Change expected number of witnesses</h1>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<input class="govuk-input govuk-input--width-2" id="inquiry-number-of-witnesses" name="inquiryNumberOfWitnessesInput" type="text" value="5">'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});

		it('should render the change expected number of witnesses page with "inquiryNumberOfWitnessesInput" text input unpopulated if inquiryHowManyWitnesses is not populated in the appellant case data', async () => {
			nock('http://test/')
				.get(`/appeals/2/appellant-cases/${appealDataFullPlanning.appellantCaseId}`)
				.reply(200, appellantCaseDataNotValidated);

			const response = await request.get(
				`${baseUrl}/2/appellant-case/procedure-preference/inquiry/witnesses/change`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Change expected number of witnesses</h1>');
			expect(unprettifiedElement.innerHTML).toContain(
				'<input class="govuk-input govuk-input--width-2" id="inquiry-number-of-witnesses" name="inquiryNumberOfWitnessesInput" type="text">'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});
	});

	describe('POST /inquiry/witnesses/change', () => {
		beforeEach(() => {
			nock('http://test/')
				.get(`/appeals/2/appellant-cases/${appealDataFullPlanning.appellantCaseId}`)
				.reply(200, appellantCaseDataNotValidated);
		});

		it(`should re-render the change expected number of witnesses page with the expected error message if "inquiryNumberOfWitnessesInput" text input is empty`, async () => {
			const response = await request
				.post(`${baseUrl}/2/appellant-case/procedure-preference/inquiry/witnesses/change`)
				.send({
					inquiryNumberOfWitnessesInput: ''
				});

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain(
				'Provide the expected number of witnesses</a>'
			);
		});

		it(`should re-render the change expected number of witnesses page with the expected error message if "inquiryNumberOfWitnessesInput" text input is not numeric`, async () => {
			const response = await request
				.post(`${baseUrl}/2/appellant-case/procedure-preference/inquiry/witnesses/change`)
				.send({
					inquiryNumberOfWitnessesInput: 'a'
				});

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain(
				'Expected number of witnesses must be a number</a>'
			);
		});

		it(`should re-render the change expected number of witnesses page with the expected error message if "inquiryNumberOfWitnessesInput" text input is outside the range 0 - 9`, async () => {
			const response = await request
				.post(`${baseUrl}/2/appellant-case/procedure-preference/inquiry/witnesses/change`)
				.send({
					inquiryNumberOfWitnessesInput: '10'
				});

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();

			const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHtml).toContain(
				'Expected number of witnesses must be a number between 0 and 9</a>'
			);
		});

		it(`should call appellant cases PATCH endpoint and redirect to the appellant case page if "inquiryNumberOfWitnessesInput" text input is populated with a valid value`, async () => {
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
				'Found. Redirecting to /appeals-service/appeal-details/2/appellant-case'
			);
		});
	});
});
