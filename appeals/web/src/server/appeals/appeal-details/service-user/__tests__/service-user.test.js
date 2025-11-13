import { appealData } from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

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
				it(`should render the ${action} service user page for an appellant when agent is present`, async () => {
					const appealId = appealData.appealId;
					const response = await request.get(
						`${baseUrl}/${appealId}/service-user/${action}/appellant`
					);
					const element = parseHtml(response.text);

					expect(element.innerHTML).toMatchSnapshot();
					expect(element.innerHTML).toContain('Appellant&#39;s details</h1>');

					const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

					expect(unprettifiedElement.innerHTML).toContain('name="firstName" type="text"');
					expect(unprettifiedElement.innerHTML).toContain('name="lastName" type="text"');
					expect(unprettifiedElement.innerHTML).toContain('name="organisationName" type="text"');
					expect(unprettifiedElement.innerHTML).toContain('Continue</button>');
					expect(unprettifiedElement.innerHTML).not.toContain('Remove appellant</a>');
				});
				it(`should render the appellant details page with email and phone number if the appeal has no agent and action is`, async () => {
					nock.cleanAll();
					const appealId = appealData.appealId;

					const appealWithNoAgent = {
						...appealData,
						agent: undefined
					};

					nock('http://test/').get(`/appeals/${appealId}`).reply(200, appealWithNoAgent);

					const response = await request.get(
						`${baseUrl}/${appealId}/service-user/change/appellant`
					);
					const element = parseHtml(response.text);
					expect(element.innerHTML).toMatchSnapshot();

					expect(element.innerHTML).toContain('Appellant&#39;s details</h1>');

					const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });
					expect(unprettifiedElement.innerHTML).not.toContain('Remove appellant</a>');
					expect(unprettifiedElement.innerHTML).not.toContain('Phone number</a>');
					expect(unprettifiedElement.innerHTML).not.toContain('Email</a>');
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
					const appealId = appealData.appealId;
					const testCases = [
						{
							name: 'firstName is null',
							data: {
								firstName: null,
								lastName: 'Jones',
								emailAddress: 'null.jones@email.com',
								phoneNumber: '+44 7782446782'
							},
							expectedErrors: ['Enter the appellant&#39;s first name</a>']
						},
						{
							name: 'firstName is empty',
							data: {
								firstName: '',
								lastName: 'Jones',
								emailAddress: 'null.jones@email.com',
								phoneNumber: '07906954865'
							},
							expectedErrors: ['Enter the appellant&#39;s first name</a>']
						},
						{
							name: 'firstName is undefined',
							data: {
								lastName: 'Jones',
								emailAddress: 'null.jones@email.com'
							},
							expectedErrors: ['Enter the appellant&#39;s first name</a>']
						},
						{
							name: 'lastName is null',
							data: {
								firstName: 'Jessica',
								lastName: null,
								emailAddress: 'jessica.null@email.com'
							},
							expectedErrors: ['Enter the appellant&#39;s last name</a>']
						},
						{
							name: 'lastName is empty',
							data: {
								firstName: 'Jessica',
								lastName: '',
								emailAddress: 'jessica.null@email.com'
							},
							expectedErrors: ['Enter the appellant&#39;s last name</a>']
						},
						{
							name: 'lastName is undefined',
							data: {
								firstName: 'Jessica',
								emailAddress: 'jessica.null@email.com'
							},
							expectedErrors: ['Enter the appellant&#39;s last name</a>']
						},
						{
							name: 'email is not an email',
							data: {
								firstName: 'Jessica',
								lastName: 'Jones',
								emailAddress: 'jessica.jones'
							},
							expectedErrors: [
								'Enter an email address in the correct format, like name@example.com</a>'
							]
						},
						{
							name: 'phone number is provided but invalid',
							data: {
								firstName: 'Jessica',
								lastName: 'Jones',
								emailAddress: 'jessica.jones@email.com',
								phoneNumber: '00000'
							},
							expectedErrors: [
								'Enter a valid UK phone number, like 01632 960 001, 07700 900 982 or +44 808 157 0192</a>'
							]
						}
					];

					testCases.forEach(({ name, data, expectedErrors }) => {
						it(`should show error(s) when ${name}`, async () => {
							const response = await request
								.post(`${baseUrl}/${appealId}/service-user/${action}/appellant`)
								.send(data);

							expect(response.statusCode).toBe(200);

							const element = parseHtml(response.text);
							expect(element.innerHTML).toMatchSnapshot();
							expect(element.innerHTML).toContain('Appellant&#39;s details</h1>');

							const errorSummaryHtml = parseHtml(response.text, {
								rootElement: '.govuk-error-summary',
								skipPrettyPrint: true
							}).innerHTML;

							expect(errorSummaryHtml).toContain('There is a problem</h2>');
							expectedErrors.forEach((error) => {
								expect(errorSummaryHtml).toContain(error);
							});
						});
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

						expect(response.statusCode).toBe(302);
						expect(response.text).toBe('Found. Redirecting to /appeals-service/appeal-details/1');
					});
				});
			}
		});
	});
	describe('POST /change/appellant (appeal with no agent)', () => {
		const appealId = appealData.appealId;
		const appealWithNoAgent = {
			...appealData,
			agent: undefined
		};

		beforeEach(() => {
			nock.cleanAll();
			nock('http://test/').get(`/appeals/${appealId}`).reply(200, appealWithNoAgent);
		});

		const testCases = [
			{
				name: 'missing email address',
				data: {
					firstName: 'Jessica',
					lastName: 'Jones',
					emailAddress: '',
					phoneNumber: '07906954865'
				},
				expectedErrors: ['Enter the appellant&#39;s email address</a>']
			},
			{
				name: 'missing email address and phone number',
				data: {
					firstName: 'Jessica',
					lastName: 'Jones',
					emailAddress: '',
					phoneNumber: ''
				},
				expectedErrors: [
					'Enter the appellant&#39;s email address</a>',
					'Enter the appellant&#39;s phone number</a>'
				]
			},
			{
				name: 'missing phone number',
				data: {
					firstName: 'Jessica',
					lastName: 'Jones',
					emailAddress: 'jessica.jones@email.com',
					phoneNumber: ''
				},
				expectedErrors: ['Enter the appellant&#39;s phone number</a>']
			}
		];

		testCases.forEach(({ name, data, expectedErrors }) => {
			it(`should show error(s) when ${name}`, async () => {
				const response = await request
					.post(`${baseUrl}/${appealId}/service-user/change/appellant`)
					.send(data);

				expect(response.statusCode).toBe(200);

				const element = parseHtml(response.text);
				expect(element.innerHTML).toMatchSnapshot();
				expect(element.innerHTML).toContain('Appellant&#39;s details</h1>');

				const errorSummaryHtml = parseHtml(response.text, {
					rootElement: '.govuk-error-summary',
					skipPrettyPrint: true
				}).innerHTML;

				expect(errorSummaryHtml).toContain('There is a problem</h2>');
				expectedErrors.forEach((error) => {
					expect(errorSummaryHtml).toContain(error);
				});
			});
		});
		it('should re-direct to appellant case if firstName, lastName are valid, and organisation, phone number, and email is available', async () => {
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
				.post(`${baseUrl}/${appealId}/appellant-case/service-user/change/appellant`)
				.send(validData);

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/appellant-case'
			);
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
