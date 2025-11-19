import { appealData, appealTypesData } from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
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

/** @typedef {import('../../../../app/auth/auth-session.service').SessionWithAuth} SessionWithAuth */

describe('change-appeal-type', () => {
	beforeEach(() => {
		installMockApi();
		nock('http://test/')
			.get('/appeals/1?include=appealType,appealStatus')
			.reply(200, appealData)
			.persist();
		nock('http://test/').get('/appeals/1/appeal-types').reply(200, appealTypesData);
	});
	afterEach(teardown);

	describe('GET /change-appeal-type/appeal-type', () => {
		it('should render the appeal type page', async () => {
			const response = await request
				.get(`${baseUrl}/1${changeAppealTypePath}${appealTypePath}`)
				.set('Appeal-Change-Type', 'true');
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('What type should this appeal be?</h1>');
			expect(element.innerHTML).toContain(
				'<input class="govuk-radios__input" id="appeal-type" name="appealType"'
			);
			expect(element.innerHTML).toContain('Continue</button>');
		});
	});

	describe('POST /change-appeal-type/appeal-type', () => {
		it('should redirect to the resubmit page if all required field is populated', async () => {
			const response = await request
				.post(`${baseUrl}/1${changeAppealTypePath}${appealTypePath}`)
				.set('Appeal-Change-Type', 'true')
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
			const response = await request
				.post(`${baseUrl}/1${changeAppealTypePath}${appealTypePath}`)
				.set('Appeal-Change-Type', 'true')
				.send({
					appealType: ''
				});

			expect(response.statusCode).toBe(200);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('What type should this appeal be?</h1>');

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
			const response = await request
				.get(`${baseUrl}/1${changeAppealTypePath}${resubmitPath}`)
				.set('Appeal-Change-Type', 'true');
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain(
				'Should the appellant be asked to resubmit this appeal?</h1>'
			);

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
		it('should redirect to the final date page the required field is equal to yes', async () => {
			const response = await request
				.post(`${baseUrl}/1${changeAppealTypePath}${resubmitPath}`)
				.send({
					appealResubmit: true
				})
				.set('Appeal-Change-Type', 'true');

			expect(response.statusCode).toBe(302);
			expect(response.headers.location).toContain(changeAppealFinalDatePath);
			expect(response.text).toContain(
				'Found. Redirecting to /appeals-service/appeal-details/1/change-appeal-type/change-appeal-final-date'
			);
		});

		it('should re-render the resubmit page with an error message if required field is missing', async () => {
			const response = await request
				.post(`${baseUrl}/1${changeAppealTypePath}${resubmitPath}`)
				.send({
					appealResubmit: ''
				})
				.set('Appeal-Change-Type', 'true');

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain(
				'Should the appellant be asked to resubmit this appeal?</h1>'
			);

			const unprettifiedErrorSummaryHTML = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(unprettifiedErrorSummaryHTML).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHTML).toContain(
				'Select yes if the appellant should be asked to resubmit the appeal</a>'
			);
		});
	});

	describe('GET /change-appeal-type/change-appeal-final-date', () => {
		it('should render the final date page', async () => {
			const response = await request
				.get(`${baseUrl}/1${changeAppealTypePath}${changeAppealFinalDatePath}`)
				.set('Appeal-Change-Type', 'true');
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('What is the final date the appellant must resubmit by?');

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
			expect(unprettifiedElement.innerHTML).toContain(
				'Confirming will ask the appellant to resubmit using the correct appeal type</div>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Confirm</button>');
		});
	});

	describe('POST /change-appeal-type/change-appeal-final-date', () => {
		beforeEach(() => {
			nock('http://test/').post('/appeals/1/appeal-change-request').reply(200, { success: true });
			nock('http://test/').post('/appeals/validate-business-date').reply(200, { success: true });
		});

		afterEach(() => {
			nock.cleanAll();
		});

		it('should redirect to the appeal details page when the required dates fields are populated and valid', async () => {
			await request
				.post(`${baseUrl}/1${changeAppealTypePath}${appealTypePath}`)
				.send({ appealType: 1 });
			await request
				.post(`${baseUrl}/1${changeAppealTypePath}${resubmitPath}`)
				.send({ appealResubmit: true });

			const response = await request
				.post(`${baseUrl}/1${changeAppealTypePath}${changeAppealFinalDatePath}`)
				.set('Appeal-Change-Type', 'true')
				.send({
					'change-appeal-final-date-day': 11,
					'change-appeal-final-date-month': 11,
					'change-appeal-final-date-year': 3000
				});
			expect(response.statusCode).toBe(302);
			expect(response.text).toBe('Found. Redirecting to /appeals-service/appeal-details/1');
		});
	});

	it('should re-render the final date page with an error message if required field is missing', async () => {
		const response = await request
			.post(`${baseUrl}/1${changeAppealTypePath}${changeAppealFinalDatePath}`)
			.set('Appeal-Change-Type', 'true')
			.send({});

		expect(response.statusCode).toBe(200);

		const element = parseHtml(response.text);
		expect(element.innerHTML).toMatchSnapshot();
		expect(element.innerHTML).toContain('What is the final date the appellant must resubmit by?');

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
			.set('Appeal-Change-Type', 'true')
			.send({
				'change-appeal-final-date-day': 32,
				'change-appeal-final-date-month': 11,
				'change-appeal-final-date-year': 2024
			});

		expect(response.statusCode).toBe(200);

		const element = parseHtml(response.text);
		expect(element.innerHTML).toMatchSnapshot();
		expect(element.innerHTML).toContain('What is the final date the appellant must resubmit by?');

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
			.set('Appeal-Change-Type', 'true')
			.send({
				'change-appeal-final-date-day': 1,
				'change-appeal-final-date-month': 13,
				'change-appeal-final-date-year': 2024
			});

		expect(response.statusCode).toBe(200);

		const element = parseHtml(response.text);
		expect(element.innerHTML).toMatchSnapshot();
		expect(element.innerHTML).toContain('What is the final date the appellant must resubmit by?');

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
			.set('Appeal-Change-Type', 'true')
			.send({
				'change-appeal-final-date-day': 11,
				'change-appeal-final-date-month': 11,
				'change-appeal-final-date-year': 'x'
			});

		expect(response.statusCode).toBe(200);

		const element = parseHtml(response.text);
		expect(element.innerHTML).toMatchSnapshot();
		expect(element.innerHTML).toContain('What is the final date the appellant must resubmit by?');

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
			.set('Appeal-Change-Type', 'true')
			.send({
				'change-appeal-final-date-day': 29,
				'change-appeal-final-date-month': 2,
				'change-appeal-final-date-year': 3000
			});

		expect(response.statusCode).toBe(200);

		const element = parseHtml(response.text);
		expect(element.innerHTML).toMatchSnapshot();
		expect(element.innerHTML).toContain('What is the final date the appellant must resubmit by?');

		const unprettifiedErrorSummaryHTML = parseHtml(response.text, {
			rootElement: '.govuk-error-summary',
			skipPrettyPrint: true
		}).innerHTML;

		expect(unprettifiedErrorSummaryHTML).toContain('There is a problem</h2>');
		expect(unprettifiedErrorSummaryHTML).toContain(
			'Deadline to resubmit the appeal must be a real date</a>'
		);
	});

	it('should re-render the final date page with an error message if the provided date is not a business day', async () => {
		const monthVariants = [
			{ description: 'numeric month', value: 1 },
			{ description: 'full month name', value: 'January' },
			{ description: 'abbreviated month name', value: 'Jan' }
		];

		for (const variant of monthVariants) {
			const response = await request
				.post(`${baseUrl}/1${changeAppealTypePath}${changeAppealFinalDatePath}`)
				.set('Appeal-Change-Type', 'true')
				.send({
					'change-appeal-final-date-day': 4,
					'change-appeal-final-date-month': variant.value,
					'change-appeal-final-date-year': 2030
				});

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot(variant.description);
			expect(element.innerHTML).toContain('What is the final date the appellant must resubmit by?');

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
			const response = await request
				.get(`${baseUrl}/1${changeAppealTypePath}${addHorizonReferencePath}`)
				.set('Appeal-Change-Type', 'true');
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain(
				'What is the reference of the new appeal on Horizon?</label></h1>'
			);

			const unprettifiedElement = parseHtml(element.innerHTML, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('name="horizon-reference" type="text">');
			expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
		});
	});

	describe('POST /change-appeal-type/add-horizon-reference', () => {
		it('should re-render the add horizon reference page with an error message if no horizon reference was provided', async () => {
			const response = await request
				.post(`${baseUrl}/1${changeAppealTypePath}${addHorizonReferencePath}`)
				.set('Appeal-Change-Type', 'true')
				.send({
					'horizon-reference': ''
				});

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain(
				'What is the reference of the new appeal on Horizon?</label></h1>'
			);

			const unprettifiedErrorSummaryHTML = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(unprettifiedErrorSummaryHTML).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHTML).toContain('Enter a valid Horizon appeal reference</a>');
		});

		it('should re-render the add horizon reference page with an error message if an appeal matching the provided horizon reference was not found in horizon', async () => {
			nock('http://test/').get('/appeals/transferred-appeal/123').reply(200, {
				caseFound: false
			});

			const response = await request
				.post(`${baseUrl}/1${changeAppealTypePath}${addHorizonReferencePath}`)
				.set('Appeal-Change-Type', 'true')
				.send({
					'horizon-reference': '123'
				});

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain(
				'What is the reference of the new appeal on Horizon?</label></h1>'
			);

			const unprettifiedErrorSummaryHTML = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(unprettifiedErrorSummaryHTML).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHTML).toContain('Enter a valid Horizon appeal reference</a>');
		});

		it('should render a custom error page stating that there is a problem with Horizon, if the transferred-appeal endpoint returns a 500', async () => {
			nock('http://test/').get('/appeals/transferred-appeal/123').reply(500);

			const response = await request
				.post(`${baseUrl}/1${changeAppealTypePath}${addHorizonReferencePath}`)
				.set('Appeal-Change-Type', 'true')
				.send({
					'horizon-reference': '123'
				});

			expect(response.statusCode).toBe(500);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Sorry, there is a problem with Horizon</h1>');
		});

		it('should redirect to the check transfer page if an appeal matching the provided horizon reference was found in horizon', async () => {
			nock('http://test/').get('/appeals/transferred-appeal/123').reply(200, {
				caseFound: true
			});

			const response = await request
				.post(`${baseUrl}/1${changeAppealTypePath}${addHorizonReferencePath}`)
				.set('Appeal-Change-Type', 'true')
				.send({
					'horizon-reference': '123'
				});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/change-appeal-type/check-transfer'
			);
		});
	});

	describe('GET /change-appeal-type/check-transfer', () => {
		it('should render a 500 error page if the required data is not present in the session', async () => {
			const response = await request
				.get(`${baseUrl}/1${changeAppealTypePath}${checkTransferPath}`)
				.set('Appeal-Change-Type', 'true');

			expect(response.statusCode).toBe(500);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Sorry, there is a problem with the service</h1>');
		});

		it('should render the check transfer page, with the appeal reference of the transferred appeal displayed in the summary, if the required data is present in the session', async () => {
			nock('http://test/').get('/appeals/transferred-appeal/123').reply(200, {
				caseFound: true
			});

			const addHorizonReferencePostResponse = await request
				.post(`${baseUrl}/1${changeAppealTypePath}${addHorizonReferencePath}`)
				.set('Appeal-Change-Type', 'true')
				.send({
					'horizon-reference': '123'
				});

			expect(addHorizonReferencePostResponse.statusCode).toBe(302);

			const response = await request
				.get(`${baseUrl}/1${changeAppealTypePath}${checkTransferPath}`)
				.set('Appeal-Change-Type', 'true');

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Details of the transferred appeal</h1>');

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'<dt class="govuk-summary-list__key"> Appeal reference</dt><dd class="govuk-summary-list__value"> 123</dd>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'You must email the appellant to let them know the appeal type has been changed.</strong>'
			);
			expect(unprettifiedElement.innerHTML).toContain(
				'name="confirm" type="checkbox" value="yes">'
			);
			expect(unprettifiedElement.innerHTML).toContain('Confirm</button>');
		});
	});

	describe('POST /change-appeal-type/check-transfer', () => {
		it('should render a 500 error page if the required data is not present in the session', async () => {
			const response = await request
				.post(`${baseUrl}/1${changeAppealTypePath}${checkTransferPath}`)
				.send({
					confirm: 'yes'
				})
				.set('Appeal-Change-Type', 'true');

			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Sorry, there is a problem with the service</h1>');
		});

		it('should re-render the check transfer page with an error message if the required data is present in the session, but the confirmation checkbox was not checked', async () => {
			nock('http://test/').get('/appeals/transferred-appeal/123').reply(200, {
				caseFound: true
			});

			const addHorizonReferencePostResponse = await request
				.post(`${baseUrl}/1${changeAppealTypePath}${addHorizonReferencePath}`)
				.set('Appeal-Change-Type', 'true')
				.send({
					'horizon-reference': '123'
				});

			expect(addHorizonReferencePostResponse.statusCode).toBe(302);

			const response = await request
				.post(`${baseUrl}/1${changeAppealTypePath}${checkTransferPath}`)
				.set('Appeal-Change-Type', 'true')
				.send({});

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Details of the transferred appeal</h1>');

			const unprettifiedErrorSummaryHTML = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(unprettifiedErrorSummaryHTML).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHTML).toContain('Confirmation must be provided</a>');
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
				.set('Appeal-Change-Type', 'true')
				.send({
					'horizon-reference': '123'
				});

			expect(addHorizonReferencePostResponse.statusCode).toBe(302);

			const response = await request
				.post(`${baseUrl}/1${changeAppealTypePath}${checkTransferPath}`)
				.set('Appeal-Change-Type', 'true')
				.send({
					confirm: 'yes'
				});

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe('Found. Redirecting to /appeals-service/appeal-details/1');
		});
	});
});
