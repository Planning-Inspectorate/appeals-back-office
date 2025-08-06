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
				expect(element.innerHTML).toContain('Agent&#39;s contact details</h1>');

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
					expect(element.innerHTML).toContain('Appellant&#39;s contact details</h1>');

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
				expect(element.innerHTML).not.toContain('Agent&#39;s contact details</h1>');
				expect(element.innerHTML).not.toContain('Agent&#39;s contact details</h1>');
				expect(element.innerHTML).toContain('Sorry, there is a problem with the service</h1>');
			});
		});
	});

	['add', 'change'].forEach((action) => {
		describe(`POST /${action}/:userType`, () => {
			describe('agent', () => {
				it('should re-render changeServiceUser with the expected error message if firstName is null', async () => {
					const appealId = appealData.appealId;
					const invalidData = {
						firstName: null,
						lastName: 'Jones',
						emailAddress: 'null.jones@email.com',
						phoneNumber: '+44 7782446782'
					};
					const response = await request
						.post(`${baseUrl}/${appealId}/service-user/${action}/agent`)
						.send(invalidData);

					expect(response.statusCode).toBe(200);

					const element = parseHtml(response.text);

					expect(element.innerHTML).toMatchSnapshot();
					expect(element.innerHTML).toContain('Agent&#39;s contact details</h1>');

					const errorSummaryHtml = parseHtml(response.text, {
						rootElement: '.govuk-error-summary',
						skipPrettyPrint: true
					}).innerHTML;

					expect(errorSummaryHtml).toContain('There is a problem</h2>');
					expect(errorSummaryHtml).toContain('Enter the agent&#39;s first name</a>');
				});

				it('should re-render changeServiceUser with the expected error message if firstName is empty', async () => {
					const appealId = appealData.appealId;
					const invalidData = {
						firstName: '',
						lastName: 'Jones',
						emailAddress: 'null.jones@email.com',
						phoneNumber: '07906954865'
					};
					const response = await request
						.post(`${baseUrl}/${appealId}/service-user/${action}/agent`)
						.send(invalidData);

					expect(response.statusCode).toBe(200);

					const element = parseHtml(response.text);

					expect(element.innerHTML).toMatchSnapshot();
					expect(element.innerHTML).toContain('Agent&#39;s contact details</h1>');

					const errorSummaryHtml = parseHtml(response.text, {
						rootElement: '.govuk-error-summary',
						skipPrettyPrint: true
					}).innerHTML;

					expect(errorSummaryHtml).toContain('There is a problem</h2>');
					expect(errorSummaryHtml).toContain('Enter the agent&#39;s first name</a>');
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
					expect(element.innerHTML).toContain('Agent&#39;s contact details</h1>');

					const errorSummaryHtml = parseHtml(response.text, {
						rootElement: '.govuk-error-summary',
						skipPrettyPrint: true
					}).innerHTML;

					expect(errorSummaryHtml).toContain('There is a problem</h2>');
					expect(errorSummaryHtml).toContain('Enter the agent&#39;s first name</a>');
					expect(errorSummaryHtml).toContain('Enter the agent&#39;s phone number</a>');
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
					expect(element.innerHTML).toContain('Agent&#39;s contact details</h1>');

					const errorSummaryHtml = parseHtml(response.text, {
						rootElement: '.govuk-error-summary',
						skipPrettyPrint: true
					}).innerHTML;

					expect(errorSummaryHtml).toContain('There is a problem</h2>');
					expect(errorSummaryHtml).toContain('Enter the agent&#39;s last name</a>');
					expect(errorSummaryHtml).toContain('Enter the agent&#39;s phone number</a>');
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
					expect(element.innerHTML).toContain('Agent&#39;s contact details</h1>');

					const errorSummaryHtml = parseHtml(response.text, {
						rootElement: '.govuk-error-summary',
						skipPrettyPrint: true
					}).innerHTML;

					expect(errorSummaryHtml).toContain('There is a problem</h2>');
					expect(errorSummaryHtml).toContain('Enter the agent&#39;s phone number</a>');
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
					expect(element.innerHTML).toContain('Agent&#39;s contact details</h1>');

					const errorSummaryHtml = parseHtml(response.text, {
						rootElement: '.govuk-error-summary',
						skipPrettyPrint: true
					}).innerHTML;

					expect(errorSummaryHtml).toContain('There is a problem</h2>');
					expect(errorSummaryHtml).toContain('Enter the agent&#39;s last name</a>');
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
					expect(element.innerHTML).toContain('Agent&#39;s contact details</h1>');

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
					expect(element.innerHTML).toContain('Agent&#39;s contact details');

					const errorSummaryHtml = parseHtml(response.text, {
						rootElement: '.govuk-error-summary',
						skipPrettyPrint: true
					}).innerHTML;

					expect(errorSummaryHtml).toContain('There is a problem</h2>');
					expect(errorSummaryHtml).toContain(
						'Enter a valid UK phone number, like 01632 960 001, 07700 900 982 or +44 808 157 0192</a>'
					);
				});

				it('should re-direct to appeals details if firstName, lastName, and email are valid', async () => {
					const appealId = appealData.appealId;
					nock('http://test/').patch(`/appeals/${appealId}/service-user`).reply(200, {
						serviceUserId: 1
					});
					const invalidData = {
						firstName: 'Jessica',
						lastName: 'Jones',
						emailAddress: 'jessica.jones@email.com'
					};
					nock('http://test/').patch(`/appeals/${appealId}`).reply(200, {
						agent: invalidData
					});
					const response = await request
						.post(`${baseUrl}/${appealId}/service-user/${action}/agent`)
						.send(invalidData);

					expect(response.statusCode).toBe(200);

					const element = parseHtml(response.text);

					expect(element.innerHTML).toMatchSnapshot();
					expect(element.innerHTML).toContain('Agent&#39;s contact details');

					const errorSummaryHtml = parseHtml(response.text, {
						rootElement: '.govuk-error-summary',
						skipPrettyPrint: true
					}).innerHTML;

					expect(errorSummaryHtml).toContain('There is a problem</h2>');
					expect(errorSummaryHtml).toContain('Enter the agent&#39;s phone number');
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
						phoneNumber: '07921909967',
						emailAddress: 'aria.murry@email.com'
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
						phoneNumber: '+44 7975451891',
						emailAddress: 'jakub.mccallum@email.com'
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
				it('should display errors if invalid characters are present in first name, last name and organisation name fields', async () => {
					const appealId = appealData.appealId;
					nock('http://test/').patch(`/appeals/${appealId}/service-user`).reply(200, {
						serviceUserId: 1
					});
					const invalidData = {
						firstName: '%',
						lastName: '%',
						organisationName: '%',
						phoneNumber: '+44 7975451891',
						emailAddress: 'jakub.mccallum@email.com'
					};
					const response = await request
						.post(`${baseUrl}/${appealId}/service-user/${action}/agent`)
						.send(invalidData);

					expect(response.statusCode).toBe(200);

					const element = parseHtml(response.text);

					expect(element.innerHTML).toMatchSnapshot();
					expect(element.innerHTML).toContain('Agent&#39;s contact details');

					const errorSummaryHtml = parseHtml(response.text, {
						rootElement: '.govuk-error-summary',
						skipPrettyPrint: true
					}).innerHTML;

					expect(errorSummaryHtml).toContain('There is a problem</h2>');
					expect(errorSummaryHtml).toContain(
						'<a href="#first-name">First name must only include letters a to z, numbers 0 to 9, and special characters such as hyphens, spaces and apostrophes'
					);
					expect(errorSummaryHtml).toContain(
						'<a href="#last-name">Last name must only include letters a to z, numbers 0 to 9, and special characters such as hyphens, spaces and apostrophes'
					);
					expect(errorSummaryHtml).toContain(
						'<a href="#organisation-name">Organisation name must only include letters a to z, numbers 0 to 9, and special characters such as hyphens, spaces and apostrophes'
					);
				});
			});
			if (action === 'change') {
				describe('appellant', () => {
					it('should re-render changeServiceUser with the expected error message if firstName is null', async () => {
						const appealId = appealData.appealId;
						const invalidData = {
							firstName: null,
							lastName: 'Jones',
							emailAddress: 'null.jones@email.com',
							phoneNumber: '+44 7782446782'
						};
						const response = await request
							.post(`${baseUrl}/${appealId}/service-user/${action}/appellant`)
							.send(invalidData);

						expect(response.statusCode).toBe(200);

						const element = parseHtml(response.text);

						expect(element.innerHTML).toMatchSnapshot();
						expect(element.innerHTML).toContain('Appellant&#39;s contact details</h1>');

						const errorSummaryHtml = parseHtml(response.text, {
							rootElement: '.govuk-error-summary',
							skipPrettyPrint: true
						}).innerHTML;

						expect(errorSummaryHtml).toContain('There is a problem</h2>');
						expect(errorSummaryHtml).toContain('Enter the appellant&#39;s first name</a>');
					});

					it('should re-render changeServiceUser with the expected error message if firstName is empty', async () => {
						const appealId = appealData.appealId;
						const invalidData = {
							firstName: '',
							lastName: 'Jones',
							emailAddress: 'null.jones@email.com',
							phoneNumber: '07906954865'
						};
						const response = await request
							.post(`${baseUrl}/${appealId}/service-user/${action}/appellant`)
							.send(invalidData);

						expect(response.statusCode).toBe(200);

						const element = parseHtml(response.text);

						expect(element.innerHTML).toMatchSnapshot();
						expect(element.innerHTML).toContain('Appellant&#39;s contact details</h1>');

						const errorSummaryHtml = parseHtml(response.text, {
							rootElement: '.govuk-error-summary',
							skipPrettyPrint: true
						}).innerHTML;

						expect(errorSummaryHtml).toContain('There is a problem</h2>');
						expect(errorSummaryHtml).toContain('Enter the appellant&#39;s first name</a>');
					});

					it('should re-render changeServiceUser with with the expected error message if firstName is undefined', async () => {
						const appealId = appealData.appealId;
						const invalidData = {
							lastName: 'Jones',
							emailAddress: 'null.jones@email.com'
						};
						const response = await request
							.post(`${baseUrl}/${appealId}/service-user/${action}/appellant`)
							.send(invalidData);

						expect(response.statusCode).toBe(200);

						const element = parseHtml(response.text);

						expect(element.innerHTML).toMatchSnapshot();
						expect(element.innerHTML).toContain('Appellant&#39;s contact details</h1>');

						const errorSummaryHtml = parseHtml(response.text, {
							rootElement: '.govuk-error-summary',
							skipPrettyPrint: true
						}).innerHTML;

						expect(errorSummaryHtml).toContain('There is a problem</h2>');
						expect(errorSummaryHtml).toContain('Enter the appellant&#39;s first name</a>');
						expect(errorSummaryHtml).toContain('Enter the appellant&#39;s phone number</a>');
					});

					it('should re-render changeServiceUser with with the expected error message if lastName is null', async () => {
						const appealId = appealData.appealId;
						const invalidData = {
							firstName: 'Jessica',
							lastName: null,
							emailAddress: 'jessica.null@email.com'
						};
						const response = await request
							.post(`${baseUrl}/${appealId}/service-user/${action}/appellant`)
							.send(invalidData);

						expect(response.statusCode).toBe(200);

						const element = parseHtml(response.text);

						expect(element.innerHTML).toMatchSnapshot();
						expect(element.innerHTML).toContain('Appellant&#39;s contact details</h1>');

						const errorSummaryHtml = parseHtml(response.text, {
							rootElement: '.govuk-error-summary',
							skipPrettyPrint: true
						}).innerHTML;

						expect(errorSummaryHtml).toContain('There is a problem</h2>');
						expect(errorSummaryHtml).toContain('Enter the appellant&#39;s last name</a>');
						expect(errorSummaryHtml).toContain('Enter the appellant&#39;s phone number</a>');
					});

					it('should re-render changeServiceUser with the expected error message if lastName is empty', async () => {
						const appealId = appealData.appealId;
						const invalidData = {
							firstName: 'Jessica',
							lastName: '',
							emailAddress: 'jessica.null@email.com'
						};
						const response = await request
							.post(`${baseUrl}/${appealId}/service-user/${action}/appellant`)
							.send(invalidData);

						expect(response.statusCode).toBe(200);

						const element = parseHtml(response.text);

						expect(element.innerHTML).toMatchSnapshot();
						expect(element.innerHTML).toContain('Appellant&#39;s contact details</h1>');

						const errorSummaryHtml = parseHtml(response.text, {
							rootElement: '.govuk-error-summary',
							skipPrettyPrint: true
						}).innerHTML;

						expect(errorSummaryHtml).toContain('There is a problem</h2>');
						expect(errorSummaryHtml).toContain('Enter the appellant&#39;s phone number</a>');
					});

					it('should re-render changeServiceUser with the expected error message if lastName is undefined', async () => {
						const appealId = appealData.appealId;
						const invalidData = {
							firstName: 'Jessica',
							emailAddress: 'jessica.null@email.com'
						};
						const response = await request
							.post(`${baseUrl}/${appealId}/service-user/${action}/appellant`)
							.send(invalidData);

						expect(response.statusCode).toBe(200);

						const element = parseHtml(response.text);

						expect(element.innerHTML).toMatchSnapshot();
						expect(element.innerHTML).toContain('Appellant&#39;s contact details</h1>');

						const errorSummaryHtml = parseHtml(response.text, {
							rootElement: '.govuk-error-summary',
							skipPrettyPrint: true
						}).innerHTML;

						expect(errorSummaryHtml).toContain('There is a problem</h2>');
						expect(errorSummaryHtml).toContain('Enter the appellant&#39;s last name</a>');
					});

					it('should re-render changeServiceUser with the expected error message if email is not an email', async () => {
						const appealId = appealData.appealId;
						const invalidData = {
							firstName: 'Jessica',
							lastName: 'Jones',
							emailAddress: 'jessica.jones'
						};
						const response = await request
							.post(`${baseUrl}/${appealId}/service-user/${action}/appellant`)
							.send(invalidData);

						expect(response.statusCode).toBe(200);

						const element = parseHtml(response.text);

						expect(element.innerHTML).toMatchSnapshot();
						expect(element.innerHTML).toContain('Appellant&#39;s contact details</h1>');

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
							.post(`${baseUrl}/${appealId}/service-user/${action}/appellant`)
							.send(invalidData);

						expect(response.statusCode).toBe(200);

						const element = parseHtml(response.text);

						expect(element.innerHTML).toMatchSnapshot();
						expect(element.innerHTML).toContain('Appellant&#39;s contact details');

						const errorSummaryHtml = parseHtml(response.text, {
							rootElement: '.govuk-error-summary',
							skipPrettyPrint: true
						}).innerHTML;

						expect(errorSummaryHtml).toContain('There is a problem</h2>');
						expect(errorSummaryHtml).toContain(
							'Enter a valid UK phone number, like 01632 960 001, 07700 900 982 or +44 808 157 0192</a>'
						);
					});

					it('should re-direct to appeals details if firstName, lastName, and email are valid', async () => {
						const appealId = appealData.appealId;
						nock('http://test/').patch(`/appeals/${appealId}/service-user`).reply(200, {
							serviceUserId: 1
						});
						const invalidData = {
							firstName: 'Jessica',
							lastName: 'Jones',
							emailAddress: 'jessica.jones@email.com'
						};
						nock('http://test/').patch(`/appeals/${appealId}`).reply(200, {
							appellant: invalidData
						});
						const response = await request
							.post(`${baseUrl}/${appealId}/service-user/${action}/appellant`)
							.send(invalidData);

						expect(response.statusCode).toBe(200);

						const element = parseHtml(response.text);

						expect(element.innerHTML).toMatchSnapshot();
						expect(element.innerHTML).toContain('Appellant&#39;s contact details');

						const errorSummaryHtml = parseHtml(response.text, {
							rootElement: '.govuk-error-summary',
							skipPrettyPrint: true
						}).innerHTML;

						expect(errorSummaryHtml).toContain('There is a problem</h2>');
						expect(errorSummaryHtml).toContain('Enter the appellant&#39;s phone number');
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
							phoneNumber: '07921909967',
							emailAddress: 'aria.murry@email.com'
						};
						nock('http://test/').patch(`/appeals/${appealId}`).reply(200, {
							appellant: validData
						});
						const response = await request
							.post(`${baseUrl}/${appealId}/service-user/${action}/appellant`)
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
							phoneNumber: '+44 7975451891',
							emailAddress: 'jakub.mccallum@email.com'
						};
						nock('http://test/').patch(`/appeals/${appealId}`).reply(200, {
							appellant: validData
						});
						const response = await request
							.post(`${baseUrl}/${appealId}/appellant-case/service-user/${action}/appellant`)
							.send(validData);

						expect(response.statusCode).toBe(302);
						expect(response.text).toBe(
							'Found. Redirecting to /appeals-service/appeal-details/1/appellant-case'
						);
					});
				});
			}
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
		it(`should render the remove service user page for an appellant`, async () => {
			const appealId = appealData.appealId;
			const response = await request.get(`${baseUrl}/${appealId}/service-user/remove/appellant`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Confirm that you want to remove the appellant</h1>');

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain('Remove appellant</button>');
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
