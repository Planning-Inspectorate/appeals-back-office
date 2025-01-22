import { parseHtml } from '@pins/platform';
import supertest from 'supertest';
import { appealData } from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import nock from 'nock';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details';

describe('service-user', () => {
	beforeEach(installMockApi);
	afterEach(teardown);

	['add', 'change'].forEach((action) => {
		describe(`GET /${action}/:userType`, () => {
			it(`should render the ${action} service user page for an agent`, async () => {
				const appealId = appealData.appealId;
				const response = await request.get(`${baseUrl}/${appealId}/service-user/${action}/agent`);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();
				expect(element.innerHTML).toContain('Update agent details</h1>');

				const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

				expect(unprettifiedElement.innerHTML).toContain('name="firstName" type="text"');
				expect(unprettifiedElement.innerHTML).toContain('name="lastName" type="text"');
				expect(unprettifiedElement.innerHTML).toContain('name="organisationName" type="text"');
				expect(unprettifiedElement.innerHTML).toContain('name="emailAddress" type="text"');
				expect(unprettifiedElement.innerHTML).toContain('name="phoneNumber" type="text"');
				expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
				expect(unprettifiedElement.innerHTML).toContain(
					action === 'change' ? 'Remove agent</a>' : ''
				);
			});

			if (action === 'change') {
				it(`should render the ${action} service user page for an appellant`, async () => {
					const appealId = appealData.appealId;
					const response = await request.get(
						`${baseUrl}/${appealId}/service-user/${action}/appellant`
					);
					const element = parseHtml(response.text);

					expect(element.innerHTML).toMatchSnapshot();
					expect(element.innerHTML).toContain('Update appellant details</h1>');

					const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

					expect(unprettifiedElement.innerHTML).toContain('name="firstName" type="text"');
					expect(unprettifiedElement.innerHTML).toContain('name="lastName" type="text"');
					expect(unprettifiedElement.innerHTML).toContain('name="organisationName" type="text"');
					expect(unprettifiedElement.innerHTML).toContain('name="emailAddress" type="text"');
					expect(unprettifiedElement.innerHTML).toContain('name="phoneNumber" type="text"');
					expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
					expect(unprettifiedElement.innerHTML).not.toContain('Remove appellant</a>');
				});
			}

			it('should render the 500 error page when the service user type is not a valid string', async () => {
				const appealId = appealData.appealId;
				const response = await request.get(`${baseUrl}/${appealId}/service-user/${action}/fail`);
				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();
				expect(element.innerHTML).not.toContain('Update appellant details</h1>');
				expect(element.innerHTML).not.toContain('Update agent details</h1>');
				expect(element.innerHTML).toContain('Sorry, there is a problem with the service</h1>');
			});
		});
	});

	['add', 'change'].forEach((action) => {
		describe(`POST /${action}/:userType`, () => {
			it('should re-render changeServiceUser with the expected error message if firstName is null', async () => {
				const appealId = appealData.appealId;
				const invalidData = {
					firstName: null,
					lastName: 'Jones',
					emailAddress: 'null.jones@email.com'
				};
				const response = await request
					.post(`${baseUrl}/${appealId}/service-user/${action}/agent`)
					.send(invalidData);

				expect(response.statusCode).toBe(200);

				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();
				expect(element.innerHTML).toContain('Update agent details</h1>');

				const errorSummaryHtml = parseHtml(response.text, {
					rootElement: '.govuk-error-summary',
					skipPrettyPrint: true
				}).innerHTML;

				expect(errorSummaryHtml).toContain('There is a problem</h2>');
				expect(errorSummaryHtml).toContain('Enter the first name</a>');
			});

			it('should re-render changeServiceUser with the expected error message if firstName is empty', async () => {
				const appealId = appealData.appealId;
				const invalidData = {
					firstName: '',
					lastName: 'Jones',
					emailAddress: 'null.jones@email.com'
				};
				const response = await request
					.post(`${baseUrl}/${appealId}/service-user/${action}/agent`)
					.send(invalidData);

				expect(response.statusCode).toBe(200);

				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();
				expect(element.innerHTML).toContain('Update agent details</h1>');

				const errorSummaryHtml = parseHtml(response.text, {
					rootElement: '.govuk-error-summary',
					skipPrettyPrint: true
				}).innerHTML;

				expect(errorSummaryHtml).toContain('There is a problem</h2>');
				expect(errorSummaryHtml).toContain('Enter the first name</a>');
			});

			it('should re-render changeServiceUser with with the expected error message if firstName is undefined', async () => {
				const appealId = appealData.appealId;
				const invalidData = {
					lastName: 'Jones',
					emailAddress: 'null.jones@email.com'
				};
				const response = await request
					.post(`${baseUrl}/${appealId}/service-user/${action}/agent`)
					.send(invalidData);

				expect(response.statusCode).toBe(200);

				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();
				expect(element.innerHTML).toContain('Update agent details</h1>');

				const errorSummaryHtml = parseHtml(response.text, {
					rootElement: '.govuk-error-summary',
					skipPrettyPrint: true
				}).innerHTML;

				expect(errorSummaryHtml).toContain('There is a problem</h2>');
				expect(errorSummaryHtml).toContain('Enter the first name</a>');
			});

			it('should re-render changeServiceUser with with the expected error message if lastName is null', async () => {
				const appealId = appealData.appealId;
				const invalidData = {
					firstName: 'Jessica',
					lastName: null,
					emailAddress: 'jessica.null@email.com'
				};
				const response = await request
					.post(`${baseUrl}/${appealId}/service-user/${action}/agent`)
					.send(invalidData);

				expect(response.statusCode).toBe(200);

				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();
				expect(element.innerHTML).toContain('Update agent details</h1>');

				const errorSummaryHtml = parseHtml(response.text, {
					rootElement: '.govuk-error-summary',
					skipPrettyPrint: true
				}).innerHTML;

				expect(errorSummaryHtml).toContain('There is a problem</h2>');
				expect(errorSummaryHtml).toContain('Enter the last name</a>');
			});

			it('should re-render changeServiceUser with the expected error message if lastName is empty', async () => {
				const appealId = appealData.appealId;
				const invalidData = {
					firstName: 'Jessica',
					lastName: '',
					emailAddress: 'jessica.null@email.com'
				};
				const response = await request
					.post(`${baseUrl}/${appealId}/service-user/${action}/agent`)
					.send(invalidData);

				expect(response.statusCode).toBe(200);

				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();
				expect(element.innerHTML).toContain('Update agent details</h1>');

				const errorSummaryHtml = parseHtml(response.text, {
					rootElement: '.govuk-error-summary',
					skipPrettyPrint: true
				}).innerHTML;

				expect(errorSummaryHtml).toContain('There is a problem</h2>');
				expect(errorSummaryHtml).toContain('Enter the last name</a>');
			});

			it('should re-render changeServiceUser with the expected error message if lastName is undefined', async () => {
				const appealId = appealData.appealId;
				const invalidData = {
					firstName: 'Jessica',
					emailAddress: 'jessica.null@email.com'
				};
				const response = await request
					.post(`${baseUrl}/${appealId}/service-user/${action}/agent`)
					.send(invalidData);

				expect(response.statusCode).toBe(200);

				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();
				expect(element.innerHTML).toContain('Update agent details</h1>');

				const errorSummaryHtml = parseHtml(response.text, {
					rootElement: '.govuk-error-summary',
					skipPrettyPrint: true
				}).innerHTML;

				expect(errorSummaryHtml).toContain('There is a problem</h2>');
				expect(errorSummaryHtml).toContain('Enter the last name</a>');
			});

			it('should re-render changeServiceUser with the expected error message if email is not an email', async () => {
				const appealId = appealData.appealId;
				const invalidData = {
					firstName: 'Jessica',
					lastName: 'Jones',
					emailAddress: 'jessica.jones'
				};
				const response = await request
					.post(`${baseUrl}/${appealId}/service-user/${action}/agent`)
					.send(invalidData);

				expect(response.statusCode).toBe(200);

				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();
				expect(element.innerHTML).toContain('Update agent details</h1>');

				const errorSummaryHtml = parseHtml(response.text, {
					rootElement: '.govuk-error-summary',
					skipPrettyPrint: true
				}).innerHTML;

				expect(errorSummaryHtml).toContain('There is a problem</h2>');
				expect(errorSummaryHtml).toContain(
					'Enter an email address in the correct format, like name@example.com</a>'
				);
			});

			it('should re-render changeServiceUser with the expected error message if phone number is provided but invalid', async () => {
				const appealId = appealData.appealId;
				const invalidData = {
					firstName: 'Jessica',
					lastName: 'Jones',
					emailAddress: 'jessica.jones@email.com',
					phoneNumber: '00000'
				};
				const response = await request
					.post(`${baseUrl}/${appealId}/service-user/${action}/agent`)
					.send(invalidData);

				expect(response.statusCode).toBe(200);

				const element = parseHtml(response.text);

				expect(element.innerHTML).toMatchSnapshot();
				expect(element.innerHTML).toContain('Update agent details</h1>');

				const errorSummaryHtml = parseHtml(response.text, {
					rootElement: '.govuk-error-summary',
					skipPrettyPrint: true
				}).innerHTML;

				expect(errorSummaryHtml).toContain('There is a problem</h2>');
				expect(errorSummaryHtml).toContain(
					'Enter a valid phone number or clear the phone number field</a>'
				);
			});

			it('should re-direct to appeals details if firstName, lastName, and email are valid', async () => {
				const appealId = appealData.appealId;
				nock('http://test/').patch(`/appeals/${appealId}/service-user`).reply(200, {
					serviceUserId: 1
				});
				const validData = {
					firstName: 'Jessica',
					lastName: 'Jones',
					emailAddress: 'jessica.jones@email.com'
				};
				nock('http://test/').patch(`/appeals/${appealId}`).reply(200, {
					agent: validData
				});
				const response = await request
					.post(`${baseUrl}/${appealId}/service-user/${action}/agent`)
					.send(validData);

				expect(response.statusCode).toBe(302);
				expect(response.text).toBe('Found. Redirecting to /appeals-service/appeal-details/1');
			});

			it('should re-direct to appeals details if firstName, lastName are valid, and organisation, phone number, and email is empty', async () => {
				const appealId = appealData.appealId;
				nock('http://test/').patch(`/appeals/${appealId}/service-user`).reply(200, {
					serviceUserId: 1
				});
				const validData = {
					firstName: 'Jessica',
					lastName: 'Jones',
					organisationName: '',
					phoneNumber: '',
					emailAddress: ''
				};
				nock('http://test/').patch(`/appeals/${appealId}`).reply(200, {
					agent: validData
				});
				const response = await request
					.post(`${baseUrl}/${appealId}/service-user/${action}/agent`)
					.send(validData);

				expect(response.statusCode).toBe(302);
				expect(response.text).toBe('Found. Redirecting to /appeals-service/appeal-details/1');
			});

			it('should re-direct to appellant case if firstName, lastName are valid, and organisation, phone number, and email is empty', async () => {
				const appealId = appealData.appealId;
				nock('http://test/').patch(`/appeals/${appealId}/service-user`).reply(200, {
					serviceUserId: 1
				});
				const validData = {
					firstName: 'Jessica',
					lastName: 'Jones',
					organisationName: '',
					phoneNumber: '',
					emailAddress: ''
				};
				nock('http://test/').patch(`/appeals/${appealId}`).reply(200, {
					agent: validData
				});
				const response = await request
					.post(`${baseUrl}/${appealId}/appellant-case/service-user/${action}/agent`)
					.send(validData);

				expect(response.statusCode).toBe(302);
				expect(response.text).toBe(
					'Found. Redirecting to /appeals-service/appeal-details/1/appellant-case'
				);
			});
		});
	});

	describe(`GET /remove/:userType`, () => {
		it(`should render the remove service user page for an agent`, async () => {
			const appealId = appealData.appealId;
			const response = await request.get(`${baseUrl}/${appealId}/service-user/remove/agent`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Confirm that you want to remove the agent</h1>');

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Remove agent</button>');
		});

		it('should render the 500 error page when the service user type is not a valid string', async () => {
			const appealId = appealData.appealId;
			const response = await request.get(`${baseUrl}/${appealId}/service-user/remove/fail`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).not.toContain('Confirm that you want to remove the agent</h1>');
			expect(element.innerHTML).toContain('Sorry, there is a problem with the service</h1>');
		});
	});

	describe(`POST /remove/:userType`, () => {
		it('should re-direct to appeals details if the user confirms they want to remove the service user', async () => {
			const appealId = appealData.appealId;
			nock('http://test/').delete(`/appeals/${appealId}/service-user`).reply(200, {
				serviceUserId: 1
			});
			const response = await request.post(`${baseUrl}/${appealId}/service-user/remove/agent`);

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe('Found. Redirecting to /appeals-service/appeal-details/1');
		});
	});
});
