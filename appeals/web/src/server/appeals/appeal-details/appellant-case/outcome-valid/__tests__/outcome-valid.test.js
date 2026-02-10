import {
	appealDataEnforcementListedBuilding,
	appealDataEnforcementNotice
} from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform/testing/html-parser.js';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';

describe('Appellant Case Valid Flow', () => {
	beforeEach(installMockApi);
	afterEach(teardown);

	describe('Enforcement Appeals', () => {
		const appealId = appealDataEnforcementNotice.appealId;
		beforeEach(() => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, appealDataEnforcementNotice)
				.persist();
			nock('http://test/')
				.get(`/appeals/${appealId}?include=appellantCase`)
				.reply(200, appealDataEnforcementNotice);
		});
		describe('GET /enforcement/ground-a', () => {
			it(`should render the 'Is the appeal ground (a) barred?' screen`, async () => {
				const response = await request.get(
					`${baseUrl}/${appealId}/appellant-case/valid/enforcement/ground-a`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Is the appeal ground (a) barred?</h1>');
				expect(unprettifiedElement.innerHTML).toContain(
					'name="enforcementGroundARadio" type="radio" value="yes">'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'name="enforcementGroundARadio" type="radio" value="no">'
				);
				expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
			});
		});

		describe('POST /enforcement/ground-a', () => {
			it(`should re-render the 'Is the appeal ground (a) barred?' screen if selection is empty`, async () => {
				const response = await request
					.post(`${baseUrl}/${appealId}/appellant-case/valid/enforcement/ground-a`)
					.send({ enforcementGroundARadio: '' });

				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();
				expect(element.innerHTML).toContain('There is a problem</h2>');
				expect(element.innerHTML).toContain('Select yes if the appeal is ground (a) barred</a>');
			});

			it(`should redirect to the 'Other Information' screen on success`, async () => {
				const response = await request
					.post(`${baseUrl}/${appealId}/appellant-case/valid/enforcement/ground-a`)
					.send({ enforcementGroundARadio: 'yes' });
				expect(response.statusCode).toBe(302);
				expect(response.text).toBe(
					`Found. Redirecting to /appeals-service/appeal-details/${appealId}/appellant-case/valid/enforcement/other-information`
				);
			});
		});

		describe('GET /enforcement/other-information', () => {
			it(`should render the 'Other Information' screen`, async () => {
				const response = await request.get(
					`${baseUrl}/${appealId}/appellant-case/valid/enforcement/other-information`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain(
					'Do you want to add any other information?</h1>'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'name="otherInformationValidRadio" type="radio" value="Yes" data-aria-controls="conditional-other-information-valid-radio">'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'name="otherInformationValidRadio" type="radio" value="No">'
				);
				expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
			});
		});

		describe('POST /enforcement/other-information', () => {
			it(`should re-render the 'Other Information' screen if selection is empty`, async () => {
				const response = await request
					.post(`${baseUrl}/${appealId}/appellant-case/valid/enforcement/other-information`)
					.send({ otherInformationValidRadio: '', otherInformationDetails: '' });

				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();
				expect(element.innerHTML).toContain('There is a problem</h2>');
				expect(element.innerHTML).toContain(
					'Select yes if you want to add any other information</a>'
				);
			});

			it(`should re-render the 'Other Information' screen if selection is yes and other information is empty`, async () => {
				const response = await request
					.post(`${baseUrl}/${appealId}/appellant-case/valid/enforcement/other-information`)
					.send({ otherInformationValidRadio: 'Yes', otherInformationDetails: '' });

				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();
				expect(element.innerHTML).toContain('There is a problem</h2>');
				expect(element.innerHTML).toContain('Enter other information</a>');
			});

			it(`should redirect to the 'Valid date' screen on success`, async () => {
				const response = await request
					.post(`${baseUrl}/${appealId}/appellant-case/valid/enforcement/other-information`)
					.send({
						otherInformationValidRadio: 'Yes',
						otherInformationDetails: 'Other information'
					});
				expect(response.statusCode).toBe(302);
				expect(response.text).toBe(
					`Found. Redirecting to /appeals-service/appeal-details/${appealId}/appellant-case/valid/enforcement/date`
				);
			});
		});

		describe('GET /enforcement/date', () => {
			it(`should render the 'Valid date' screen`, async () => {
				const response = await request.get(
					`${baseUrl}/${appealId}/appellant-case/valid/enforcement/date`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('Valid date</h1>');
				expect(unprettifiedElement.innerHTML).toContain(
					'This is the date all case documentation was received and the appeal was valid.</p>'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'name="valid-date-day" type="text" inputmode="numeric">'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'name="valid-date-month" type="text" inputmode="numeric">'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'name="valid-date-year" type="text" inputmode="numeric">'
				);
				expect(unprettifiedElement.innerHTML).toContain('Confirm</button>');
			});
		});

		describe('POST /enforcement/date', () => {
			it(`should re-render the 'Valid date' screen if the date is incorrect`, async () => {
				const response = await request
					.post(`${baseUrl}/${appealId}/appellant-case/valid/enforcement/date`)
					.send({
						'valid-date-day': '',
						'valid-date-month': '',
						'valid-date-year': ''
					});

				expect(response.statusCode).toBe(200);

				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();
				expect(element.innerHTML).toContain('Enter the decision date</a>');

				const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
					rootElement: '.govuk-error-summary',
					skipPrettyPrint: true
				}).innerHTML;

				expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
				expect(unprettifiedErrorSummaryHtml).toContain('Enter the decision date');
			});

			it(`should re-render the 'Valid date' screen if the date is in the future`, async () => {
				const response = await request
					.post(`${baseUrl}/${appealId}/appellant-case/valid/enforcement/date`)
					.send({
						'valid-date-day': '1',
						'valid-date-month': 'Jan',
						'valid-date-year': '3000'
					});

				expect(response.statusCode).toBe(200);

				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();
				expect(element.innerHTML).toContain('The decision date must be today or in the past</a>');

				const unprettifiedErrorSummaryHtml = parseHtml(response.text, {
					rootElement: '.govuk-error-summary',
					skipPrettyPrint: true
				}).innerHTML;

				expect(unprettifiedErrorSummaryHtml).toContain('There is a problem</h2>');
				expect(unprettifiedErrorSummaryHtml).toContain(
					'The decision date must be today or in the past'
				);
			});

			it(`should redirect to the 'Check details' screen on success`, async () => {
				const response = await request
					.post(`${baseUrl}/${appealId}/appellant-case/valid/enforcement/date`)
					.send({
						'valid-date-day': '1',
						'valid-date-month': 'Jan',
						'valid-date-year': '2025'
					});

				expect(response.statusCode).toBe(302);
				expect(response.text).toBe(
					`Found. Redirecting to /appeals-service/appeal-details/${appealId}/appellant-case/valid/enforcement/check-details`
				);
			});
		});

		describe('GET /enforcement/check-details', () => {
			afterEach(() => {
				nock.cleanAll();
			});
			it(`should render the 'Check details' screen`, async () => {
				// mock API call
				nock('http://test/')
					.get(`/appeals/${appealId}?include=appellantCase`)
					.reply(200, appealDataEnforcementNotice)
					.persist();

				// set session data
				const groundAResponse = await request
					.post(`${baseUrl}/${appealId}/appellant-case/valid/enforcement/ground-a`)
					.send({ enforcementGroundARadio: 'yes' });
				expect(groundAResponse.statusCode).toBe(302);

				const otherInformationRepsonse = await request
					.post(`${baseUrl}/${appealId}/appellant-case/valid/enforcement/other-information`)
					.send({
						otherInformationValidRadio: 'Yes',
						otherInformationDetails: 'Other information'
					});
				expect(otherInformationRepsonse.statusCode).toBe(302);

				const dateResponse = await request
					.post(`${baseUrl}/${appealId}/appellant-case/valid/enforcement/date`)
					.send({
						'valid-date-day': '1',
						'valid-date-month': 'Jan',
						'valid-date-year': '2025'
					});
				expect(dateResponse.statusCode).toBe(302);

				// get details
				const response = await request.get(
					`${baseUrl}/${appealId}/appellant-case/valid/enforcement/check-details`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain(
					'Check details and mark appeal as valid</h1>'
				);
				expect(unprettifiedElement.innerHTML).toContain('Review decision</dt>');
				expect(unprettifiedElement.innerHTML).toContain('Is the appeal ground (a) barred?</dt>');
				expect(unprettifiedElement.innerHTML).toContain(
					'Do you want to add any other information?</dt>'
				);
				expect(unprettifiedElement.innerHTML).toContain('Valid date for case</dt>');
				expect(unprettifiedElement.innerHTML).toContain(
					'We will mark the appeal as valid and send an email to the relevant parties.</p>'
				);
				expect(unprettifiedElement.innerHTML).toContain('Mark appeal as valid</button>');
			});
		});

		describe('POST /enforcement/check-details', () => {
			it(`should redirect to the Check Details' screen on success`, async () => {
				// mock API call
				nock('http://test/')
					.get(`/appeals/${appealId}?include=appellantCase`)
					.reply(200, appealDataEnforcementNotice)
					.persist();
				nock('http://test/')
					.patch(
						`/appeals/${appealId}/appellant-cases/${appealDataEnforcementNotice.appellantCaseId}`
					)
					.reply(200);

				// set session data
				const groundAResponse = await request
					.post(`${baseUrl}/${appealId}/appellant-case/valid/enforcement/ground-a`)
					.send({ enforcementGroundARadio: 'yes' });
				expect(groundAResponse.statusCode).toBe(302);

				const otherInformationRepsonse = await request
					.post(`${baseUrl}/${appealId}/appellant-case/valid/enforcement/other-information`)
					.send({
						otherInformationValidRadio: 'Yes',
						otherInformationDetails: 'Other information'
					});
				expect(otherInformationRepsonse.statusCode).toBe(302);

				const dateResponse = await request
					.post(`${baseUrl}/${appealId}/appellant-case/valid/enforcement/date`)
					.send({
						'valid-date-day': '1',
						'valid-date-month': 'Jan',
						'valid-date-year': '2025'
					});
				expect(dateResponse.statusCode).toBe(302);

				// check details response
				const response = await request.post(
					`${baseUrl}/${appealId}/appellant-case/valid/enforcement/check-details`
				);

				expect(response.statusCode).toBe(302);
				expect(response.text).toBe(
					`Found. Redirecting to /appeals-service/appeal-details/${appealId}`
				);
			});
		});

		it(`should redirect to the Check Details' screen on success`, async () => {
			// mock API call
			nock('http://test/')
				.get(`/appeals/${appealId}?include=appellantCase`)
				.reply(200, appealDataEnforcementNotice)
				.persist();
			nock('http://test/')
				.patch(
					`/appeals/${appealId}/appellant-cases/${appealDataEnforcementNotice.appellantCaseId}`
				)
				.reply(200);

			// set session data
			const groundAResponse = await request
				.post(`${baseUrl}/${appealId}/appellant-case/valid/enforcement/ground-a`)
				.send({ enforcementGroundARadio: 'yes' });
			expect(groundAResponse.statusCode).toBe(302);

			const otherInformationRepsonse = await request
				.post(`${baseUrl}/${appealId}/appellant-case/valid/enforcement/other-information`)
				.send({
					otherInformationValidRadio: 'Yes',
					otherInformationDetails: 'Other information'
				});
			expect(otherInformationRepsonse.statusCode).toBe(302);

			const dateResponse = await request
				.post(`${baseUrl}/${appealId}/appellant-case/valid/enforcement/date`)
				.send({
					'valid-date-day': '1',
					'valid-date-month': 'Jan',
					'valid-date-year': '2025'
				});
			expect(dateResponse.statusCode).toBe(302);

			// check details response
			const response = await request.post(
				`${baseUrl}/${appealId}/appellant-case/valid/enforcement/check-details`
			);

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				`Found. Redirecting to /appeals-service/appeal-details/${appealId}`
			);
		});
	});

	describe('Enforcement listed Appeals', () => {
		const appealId = appealDataEnforcementNotice.appealId;
		beforeEach(() => {
			nock('http://test/')
				.get(`/appeals/${appealId}?include=all`)
				.reply(200, appealDataEnforcementListedBuilding)
				.persist();
			nock('http://test/')
				.get(`/appeals/${appealId}?include=appellantCase`)
				.reply(200, appealDataEnforcementListedBuilding);
		});
		describe('GET /enforcement/check-details', () => {
			afterEach(() => {
				nock.cleanAll();
			});
			it(`should render the 'Check details' screen for ELB`, async () => {
				// mock API call
				nock('http://test/')
					.get(`/appeals/${appealId}?include=appellantCase`)
					.reply(200, appealDataEnforcementListedBuilding)
					.persist();

				// set session data

				const validCaseRepsonse = await request.post(`${baseUrl}/${appealId}/appellant-case`).send({
					reviewOutcome: 'valid'
				});

				expect(validCaseRepsonse.statusCode).toBe(302);

				const otherInformationRepsonse = await request
					.post(`${baseUrl}/${appealId}/appellant-case/valid/enforcement/other-information`)
					.send({
						webAppellantCaseReviewOutcome: {
							validationOutcome: 'valid',
							outcome: 'valid'
						},
						otherInformationValidRadio: 'Yes',
						otherInformationDetails: 'Other information'
					});
				expect(otherInformationRepsonse.statusCode).toBe(302);

				const dateResponse = await request
					.post(`${baseUrl}/${appealId}/appellant-case/valid/enforcement/date`)
					.send({
						'valid-date-day': '1',
						'valid-date-month': 'Jan',
						'valid-date-year': '2025',
						validationOutcome: 'valid',
						outcome: 'valid'
					});
				expect(dateResponse.statusCode).toBe(302);

				// get details
				const response = await request.get(
					`${baseUrl}/${appealId}/appellant-case/valid/enforcement/check-details`
				);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain(
					'Check details and mark appeal as valid</h1>'
				);
				expect(unprettifiedElement.innerHTML).toContain('Review decision</dt>');
				expect(unprettifiedElement.innerHTML).not.toContain(
					'Is the appeal ground (a) barred?</dt>'
				);
				expect(unprettifiedElement.innerHTML).toContain(
					'Do you want to add any other information?</dt>'
				);
				expect(unprettifiedElement.innerHTML).toContain('Valid date for case</dt>');
				expect(unprettifiedElement.innerHTML).toContain(
					'We will mark the appeal as valid and send an email to the relevant parties.</p>'
				);
				expect(unprettifiedElement.innerHTML).toContain('Mark appeal as valid</button>');
			});
		});

		describe('POST /enforcement/check-details', () => {
			it(`should redirect to the Check Details' screen on success`, async () => {
				// mock API call
				nock('http://test/')
					.get(`/appeals/${appealId}?include=appellantCase`)
					.reply(200, appealDataEnforcementNotice)
					.persist();
				nock('http://test/')
					.patch(
						`/appeals/${appealId}/appellant-cases/${appealDataEnforcementNotice.appellantCaseId}`
					)
					.reply(200);

				// set session data
				const groundAResponse = await request
					.post(`${baseUrl}/${appealId}/appellant-case/valid/enforcement/ground-a`)
					.send({ enforcementGroundARadio: 'yes' });
				expect(groundAResponse.statusCode).toBe(302);

				const otherInformationRepsonse = await request
					.post(`${baseUrl}/${appealId}/appellant-case/valid/enforcement/other-information`)
					.send({
						otherInformationValidRadio: 'Yes',
						otherInformationDetails: 'Other information'
					});
				expect(otherInformationRepsonse.statusCode).toBe(302);

				const dateResponse = await request
					.post(`${baseUrl}/${appealId}/appellant-case/valid/enforcement/date`)
					.send({
						'valid-date-day': '1',
						'valid-date-month': 'Jan',
						'valid-date-year': '2025'
					});
				expect(dateResponse.statusCode).toBe(302);

				// check details response
				const response = await request.post(
					`${baseUrl}/${appealId}/appellant-case/valid/enforcement/check-details`
				);

				expect(response.statusCode).toBe(302);
				expect(response.text).toBe(
					`Found. Redirecting to /appeals-service/appeal-details/${appealId}`
				);
			});
		});
	});
});
