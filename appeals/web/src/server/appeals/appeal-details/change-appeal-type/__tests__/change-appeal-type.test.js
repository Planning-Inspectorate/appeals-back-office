import { appealData, appealTypesData } from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { jest } from '@jest/globals';
import { parseHtml } from '@pins/platform';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';
const changeAppealTypePath = '/change-appeal-type';
const appealTypePath = '/appeal-type';
const resubmitPath = '/resubmit';
const changeAppealFinalDatePath = '/change-appeal-final-date';
const addHorizonReferencePath = '/add-horizon-reference';
const checkTransferPath = '/check-transfer';
const markAppealInvalidPath = '/mark-appeal-invalid';
const checkChangeAppealFinalDatePath = '/check-change-appeal-final-date';
const updateAppealPath = '/update-appeal';

/** @typedef {import('../../../../app/auth/auth-session.service').SessionWithAuth} SessionWithAuth */

const validAppealChangeTypeStatuses = [
	APPEAL_CASE_STATUS.ASSIGN_CASE_OFFICER,
	APPEAL_CASE_STATUS.VALIDATION
];

const invalidAppealChangeTypeStatuses = Object.values(APPEAL_CASE_STATUS).filter(
	(status) => !validAppealChangeTypeStatuses.includes(status)
);

describe('change-appeal-type', () => {
	beforeEach(() => {
		installMockApi();
		nock('http://test/').get('/appeals/1').reply(200, appealData);
		nock('http://test/').get('/appeals/appeal-types').reply(200, appealTypesData);
		//mocking the for example date for snapshots
		Date.now = jest.fn(() => new Date(Date.UTC(2024, 8, 14)).valueOf());
	});
	afterEach(teardown);

	describe('GET /change-appeal-type/appeal-type', () => {
		invalidAppealChangeTypeStatuses.forEach((status) => {
			it(`should render the you cannot update the appeal type page for appeals with status ${status}`, async () => {
				const amendedAppeal = {
					...appealData,
					appealId: '123943',
					appealStatus: status
				};

				installMockApi();
				nock('http://test/').get('/appeals/123943').reply(200, amendedAppeal);
				nock('http://test/').get('/appeals/123943/appeal-types').reply(200, appealTypesData);

				const response = await request.get(
					`${baseUrl}/123943${changeAppealTypePath}${appealTypePath}`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();
				expect(element.innerHTML).toContain('You cannot update the appeal type</h1>');
				expect(element.innerHTML).toContain('govuk-list govuk-list--bullet');
			});
		});

		validAppealChangeTypeStatuses.forEach((status) => {
			it(`should render the appeal type page for appeals with status ${status}`, async () => {
				const amendedAppeal = {
					...appealData,
					appealId: '123943',
					appealStatus: status
				};

				installMockApi();
				nock('http://test/').get('/appeals/123943').reply(200, amendedAppeal);
				nock('http://test/').get('/appeals/123943/appeal-types').reply(200, appealTypesData);

				const response = await request.get(
					`${baseUrl}/123943${changeAppealTypePath}${appealTypePath}`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();
				expect(element.innerHTML).toContain('Appeal type</h1>');
				expect(element.innerHTML).toContain(
					'<input class="govuk-radios__input" id="appeal-type" name="appealType"'
				);
				expect(element.innerHTML).toContain('Continue</button>');
			});
		});
	});

	describe('POST /change-appeal-type/appeal-type', () => {
		it('should redirect to the resubmit page if all required field is populated', async () => {
			const response = await request
				.post(`${baseUrl}/1${changeAppealTypePath}${appealTypePath}`)
				.send({
					appealType: 1
				});

			expect(response.statusCode).toBe(302);
			expect(response.headers.location).toContain(resubmitPath);
			expect(response.text).toContain(
				'Found. Redirecting to /appeals-service/appeal-details/1/change-appeal-type/resubmit'
			);
		});

		it('should re-render the appeal type page with an error message if required field is missing', async () => {
			const amendedAppeal = {
				...appealData,
				appealId: '123943',
				appealStatus: APPEAL_CASE_STATUS.VALIDATION
			};

			nock('http://test/').get('/appeals/123943').reply(200, amendedAppeal);
			nock('http://test/').get('/appeals/123943/appeal-types').reply(200, appealTypesData);

			const response = await request
				.post(`${baseUrl}/123943${changeAppealTypePath}${appealTypePath}`)
				.send({
					appealType: ''
				});

			expect(response.statusCode).toBe(200);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Appeal type</h1>');

			const unprettifiedErrorSummaryHTML = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(unprettifiedErrorSummaryHTML).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHTML).toContain('Select the appeal type</a>');
		});
	});

	describe('GET /change-appeal-type/resubmit', () => {
		it('should render the resubmit page', async () => {
			const response = await request.get(`${baseUrl}/1${changeAppealTypePath}${resubmitPath}`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Does the appellant need to resubmit the appeal?</h1>');

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'name="appealResubmit" type="radio" value="true">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="appealResubmit" type="radio" value="false">'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});
	});

	describe('POST /change-appeal-type/resubmit', () => {
		it('should redirect to the mark appeal invalid page the required field is equal to yes', async () => {
			await request.post(`${baseUrl}/1${changeAppealTypePath}${appealTypePath}`).send({
				appealType: 1
			});

			const response = await request
				.post(`${baseUrl}/1${changeAppealTypePath}${resubmitPath}`)
				.send({
					appealResubmit: true
				});

			expect(response.statusCode).toBe(302);
			expect(response.headers.location).toContain(markAppealInvalidPath);
			expect(response.text).toContain(
				'Found. Redirecting to /appeals-service/appeal-details/1/change-appeal-type/mark-appeal-invalid'
			);
		});

		it('should redirect to update appeal page if the required field is equal to no and the appeal type is in Manage appeals', async () => {
			nock('http://test/')
				.get('/appeals/appeal-types?filterEnabled=true')
				.reply(200, appealTypesData);
			await request.post(`${baseUrl}/1${changeAppealTypePath}${appealTypePath}`).send({
				appealType: 66
			});

			const response = await request
				.post(`${baseUrl}/1${changeAppealTypePath}${resubmitPath}`)
				.send({
					appealResubmit: false
				});

			expect(response.statusCode).toBe(302);
			expect(response.headers.location).toContain('/update-appeal');
			expect(response.text).toContain(
				'Found. Redirecting to /appeals-service/appeal-details/1/change-appeal-type/update-appeal'
			);
		});

		it('should redirect to transfer appeal page if the required field is equal to no and appeal type is not in Manage appeals', async () => {
			nock('http://test/')
				.get('/appeals/appeal-types?filterEnabled=true')
				.reply(200, appealTypesData);
			await request.post(`${baseUrl}/1${changeAppealTypePath}${appealTypePath}`).send({
				appealType: 12
			});

			const response = await request
				.post(`${baseUrl}/1${changeAppealTypePath}${resubmitPath}`)
				.send({
					appealResubmit: false
				});

			expect(response.statusCode).toBe(302);
			expect(response.headers.location).toContain('/transfer-appeal');
			expect(response.text).toContain(
				'Found. Redirecting to /appeals-service/appeal-details/1/change-appeal-type/transfer-appeal'
			);
		});

		it('should re-render the resubmit page with an error message if required field is missing', async () => {
			const response = await request
				.post(`${baseUrl}/1${changeAppealTypePath}${resubmitPath}`)
				.send({
					appealResubmit: ''
				});

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Does the appellant need to resubmit the appeal?</h1>');

			const unprettifiedErrorSummaryHTML = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(unprettifiedErrorSummaryHTML).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHTML).toContain(
				'Select yes if the appellant needs to resubmit the appeal</a>'
			);
		});
	});

	describe('GET /change-appeal-type/change-appeal-final-date', () => {
		beforeEach(async () => {
			// Ensure changeAppealType is set in session
			await request.post(`${baseUrl}/1${changeAppealTypePath}${appealTypePath}`).send({
				appealType: 1
			});
		});

		it('should render the final date page', async () => {
			const response = await request.get(
				`${baseUrl}/1${changeAppealTypePath}${changeAppealFinalDatePath}`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Deadline to resubmit appeal');

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'name="change-appeal-final-date-day" type="text" value="" inputmode="numeric">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="change-appeal-final-date-month" type="text" value="" inputmode="numeric">'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="change-appeal-final-date-year" type="text" value="" inputmode="numeric">'
			);
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});
	});

	describe('POST /change-appeal-type/change-appeal-final-date', () => {
		beforeEach(async () => {
			nock('http://test/').post('/appeals/1/appeal-change-request').reply(200, { success: true });
			nock('http://test/').post('/appeals/validate-business-date').reply(200, { success: true });
			await request.post(`${baseUrl}/1${changeAppealTypePath}${appealTypePath}`).send({
				appealType: 1
			});
		});

		afterEach(() => {
			nock.cleanAll();
		});

		it('should redirect to the check change final date page when the required dates fields are populated and valid', async () => {
			await request
				.post(`${baseUrl}/1${changeAppealTypePath}${appealTypePath}`)
				.send({ appealType: 1 });
			await request
				.post(`${baseUrl}/1${changeAppealTypePath}${resubmitPath}`)
				.send({ appealResubmit: true });

			const response = await request
				.post(`${baseUrl}/1${changeAppealTypePath}${changeAppealFinalDatePath}`)
				.send({
					'change-appeal-final-date-day': 11,
					'change-appeal-final-date-month': 11,
					'change-appeal-final-date-year': 3000
				});
			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/change-appeal-type/check-change-appeal-final-date'
			);
		});

		it('should re-render the final date page with an error message if required field is missing', async () => {
			const response = await request
				.post(`${baseUrl}/1${changeAppealTypePath}${changeAppealFinalDatePath}`)
				.send({});

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Deadline to resubmit appeal');

			const unprettifiedErrorSummaryHTML = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(unprettifiedErrorSummaryHTML).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHTML).toContain('Enter the deadline to resubmit the appeal');
		});

		it('should re-render the final date page with an error message if the provided date day is invalid', async () => {
			const response = await request
				.post(`${baseUrl}/1${changeAppealTypePath}${changeAppealFinalDatePath}`)
				.send({
					'change-appeal-final-date-day': 32,
					'change-appeal-final-date-month': 11,
					'change-appeal-final-date-year': 2024
				});

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Deadline to resubmit appeal');

			const unprettifiedErrorSummaryHTML = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(unprettifiedErrorSummaryHTML).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHTML).toContain(
				'Deadline to resubmit the appeal day must be between 1 and 31</a>'
			);
		});

		it('should re-render the final date page with an error message if the provided date month is invalid', async () => {
			const response = await request
				.post(`${baseUrl}/1${changeAppealTypePath}${changeAppealFinalDatePath}`)
				.send({
					'change-appeal-final-date-day': 1,
					'change-appeal-final-date-month': 13,
					'change-appeal-final-date-year': 2024
				});

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Deadline to resubmit appeal');

			const unprettifiedErrorSummaryHTML = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(unprettifiedErrorSummaryHTML).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHTML).toContain(
				'Deadline to resubmit the appeal month must be between 1 and 12</a>'
			);
		});

		it('should re-render the final date page with an error message if the provided date year is invalid', async () => {
			const response = await request
				.post(`${baseUrl}/1${changeAppealTypePath}${changeAppealFinalDatePath}`)
				.send({
					'change-appeal-final-date-day': 11,
					'change-appeal-final-date-month': 11,
					'change-appeal-final-date-year': 'x'
				});

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Deadline to resubmit appeal');

			const unprettifiedErrorSummaryHTML = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(unprettifiedErrorSummaryHTML).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHTML).toContain(
				'Deadline to resubmit the appeal year must be a number</a>'
			);
		});

		it('should re-render the final date page with an error message if an invalid date was provided', async () => {
			const response = await request
				.post(`${baseUrl}/1${changeAppealTypePath}${changeAppealFinalDatePath}`)
				.send({
					'change-appeal-final-date-day': 29,
					'change-appeal-final-date-month': 2,
					'change-appeal-final-date-year': 3000
				});

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Deadline to resubmit appeal');

			const unprettifiedErrorSummaryHTML = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(unprettifiedErrorSummaryHTML).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHTML).toContain(
				'Deadline to resubmit the appeal must be a real date</a>'
			);
		});
	});

	it('should re-render the final date page with an error message if the provided date is not a business day', async () => {
		await request.post(`${baseUrl}/1${changeAppealTypePath}${appealTypePath}`).send({
			appealType: 1
		});

		const monthVariants = [
			{ description: 'numeric month', value: 1 },
			{ description: 'full month name', value: 'January' },
			{ description: 'abbreviated month name', value: 'Jan' }
		];

		for (const variant of monthVariants) {
			const response = await request
				.post(`${baseUrl}/1${changeAppealTypePath}${changeAppealFinalDatePath}`)
				.send({
					'change-appeal-final-date-day': 4,
					'change-appeal-final-date-month': variant.value,
					'change-appeal-final-date-year': 2030
				});

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot(variant.description);
			expect(element.innerHTML).toContain('Deadline to resubmit appeal');

			const unprettifiedErrorSummaryHTML = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(unprettifiedErrorSummaryHTML).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHTML).toContain('The date must be a business day</a>');
		}
	});

	describe('GET /change-appeal-type/add-horizon-reference', () => {
		it('should render the add horizon reference page', async () => {
			const response = await request.get(
				`${baseUrl}/1${changeAppealTypePath}${addHorizonReferencePath}`
			);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Horizon reference</label></h1>');

			const unprettifiedElement = parseHtml(element.innerHTML, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('name="horizon-reference" type="text">');
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});
	});

	describe('POST /change-appeal-type/add-horizon-reference', () => {
		it.each([
			['missing', '', 'Enter a reference number'],
			['too short', '12345', 'Reference number must be 7 characters'],
			['too long', '12345678', 'Reference number must be 7 characters'],
			['not only numeric', 'a123456', 'Reference number must only include numbers']
		])(
			'should re-render the add horizon reference page with an error message if the horizon reference is: %s',
			async (_, invalidReference, expectedError) => {
				const response = await request
					.post(`${baseUrl}/1${changeAppealTypePath}${addHorizonReferencePath}`)
					.send({
						'horizon-reference': invalidReference
					});

				expect(response.statusCode).toBe(200);

				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();
				expect(element.innerHTML).toContain('Horizon reference</label></h1>');

				const unprettifiedErrorSummaryHTML = parseHtml(response.text, {
					rootElement: '.govuk-error-summary',
					skipPrettyPrint: true
				}).innerHTML;

				expect(unprettifiedErrorSummaryHTML).toContain('There is a problem</h2>');
				expect(unprettifiedErrorSummaryHTML).toContain(`${expectedError}</a>`);
			}
		);

		it('should redirect to the check transfer page if a valid 7 digit reference was entered', async () => {
			const response = await request
				.post(`${baseUrl}/1${changeAppealTypePath}${addHorizonReferencePath}`)
				.send({
					'horizon-reference': '1234567'
				});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/change-appeal-type/check-transfer'
			);
		});
	});

	describe('GET /change-appeal-type/check-transfer', () => {
		it('should render a 500 error page if the required data is not present in the session', async () => {
			const response = await request.get(`${baseUrl}/1${changeAppealTypePath}${checkTransferPath}`);

			expect(response.statusCode).toBe(500);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Sorry, there is a problem with the service</h1>');
		});

		it('should render the check transfer page, with the appeal reference of the transferred appeal displayed in the summary, if the required data is present in the session', async () => {
			const addHorizonReferencePostResponse = await request
				.post(`${baseUrl}/1${changeAppealTypePath}${addHorizonReferencePath}`)
				.send({
					'horizon-reference': '1234567'
				});

			expect(addHorizonReferencePostResponse.statusCode).toBe(302);

			const response = await request.get(`${baseUrl}/1${changeAppealTypePath}${checkTransferPath}`);

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Check details and mark case as transferred</h1>');

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'<dt class="govuk-summary-list__key"> Horizon reference</dt><dd class="govuk-summary-list__value"> 1234567</dd>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Mark case as transferred</button>');
		});
	});

	describe('POST /change-appeal-type/check-transfer', () => {
		it('should render a 500 error page if the required data is not present in the session', async () => {
			const response = await request
				.post(`${baseUrl}/1${changeAppealTypePath}${checkTransferPath}`)
				.send({
					confirm: 'yes'
				});

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Sorry, there is a problem with the service</h1>');
		});

		it('should redirect to the case details page if the required data is present in the session and the confirmation checkbox was checked', async () => {
			nock('http://test/').get('/appeals/transferred-appeal/123').reply(200, {
				caseFound: true
			});
			nock('http://test/')
				.post('/appeals/1/appeal-transfer-confirmation')
				.reply(200, { success: true });

			const addHorizonReferencePostResponse = await request
				.post(`${baseUrl}/1${changeAppealTypePath}${addHorizonReferencePath}`)
				.send({
					'horizon-reference': '1234567'
				});

			expect(addHorizonReferencePostResponse.statusCode).toBe(302);

			const response = await request
				.post(`${baseUrl}/1${changeAppealTypePath}${checkTransferPath}`)
				.send({
					confirm: 'yes'
				});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe('Found. Redirecting to /appeals-service/appeal-details/1');
		});
	});

	describe('GET /change-appeal-type/check-change-appeal-final-date', () => {
		beforeEach(async () => {
			// Ensure changeAppealType is set in session
			await request.post(`${baseUrl}/1${changeAppealTypePath}${appealTypePath}`).send({
				appealType: 1
			});
		});

		it('should render the check change appeal final date page', async () => {
			const response = await request.get(
				`${baseUrl}/1${changeAppealTypePath}${checkChangeAppealFinalDatePath}`
			);

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Check details and mark appeal as invalid</h1>');

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'<dt class="govuk-summary-list__key"> Deadline to resubmit appeal</dt>'
			);

			expect(unprettifiedElement.innerHTML).toContain('Mark appeal as invalid</button>');
		});
	});

	describe('POST /change-appeal-type/check-change-appeal-final-date', () => {
		beforeEach(async () => {
			// Ensure changeAppealType is set in session
			await request.post(`${baseUrl}/1${changeAppealTypePath}${appealTypePath}`).send({
				appealType: 1
			});
		});

		it('should redirect to the case details page', async () => {
			nock('http://test/')
				.post('/appeals/1/appeal-resubmit-mark-invalid')
				.reply(200, { success: true });

			const response = await request
				.post(`${baseUrl}/1${changeAppealTypePath}${checkChangeAppealFinalDatePath}`)
				.send();

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe('Found. Redirecting to /appeals-service/appeal-details/1');
		});
	});

	describe('GET /change-appeal-type/update-appeal', () => {
		it('should render the check details and update appeal page', async () => {
			// Ensure change appeal type is set in session
			await request.post(`${baseUrl}/1${changeAppealTypePath}${appealTypePath}`).send({
				appealType: 75
			});

			const response = await request.get(`${baseUrl}/1${changeAppealTypePath}${updateAppealPath}`);

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Check details and update appeal type</h1>');
		});
	});

	describe('POST /change-appeal-type/update-appeal', () => {
		it('should render a 500 error page if the required data is not present in the session', async () => {
			const response = await request.post(`${baseUrl}/1${changeAppealTypePath}${updateAppealPath}`);

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Sorry, there is a problem with the service</h1>');
		});

		it('should redirect to appeal details screen on success', async () => {
			// nock update server request
			nock('http://test/').post('/appeals/1/appeal-update-request').reply(200);
			// Ensure change appeal type is set in session
			await request.post(`${baseUrl}/1${changeAppealTypePath}${appealTypePath}`).send({
				appealType: 75
			});

			const response = await request.post(`${baseUrl}/1${changeAppealTypePath}${updateAppealPath}`);

			expect(response.statusCode).toBe(302);
			expect(response.headers.location).toContain('/appeals-service/appeal-details/1');
			expect(response.text).toContain('Found. Redirecting to /appeals-service/appeal-details/1');
		});
	});
});
