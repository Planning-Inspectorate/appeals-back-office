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

	describe('GET /change/:userType', () => {
		it('should render the change service user page for an agent', async () => {
			const appealId = appealData.appealId;
			const response = await request.get(`${baseUrl}/${appealId}/service-user/change/agent`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Update agent details');
		});

		it('should render the change service user page for an appellant', async () => {
			const appealId = appealData.appealId;
			const response = await request.get(`${baseUrl}/${appealId}/service-user/change/appellant`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Update appellant details');
		});

		it('should render the 500 error page when the service user type is not a valid string', async () => {
			const appealId = appealData.appealId;
			const response = await request.get(`${baseUrl}/${appealId}/service-user/change/fail`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).not.toContain('Update appellant details');
			expect(element.innerHTML).not.toContain('Update agent details');
			expect(element.innerHTML).toContain('Sorry, there is a problem with the service');
		});
	});

	describe('POST /change/:userType', () => {
		it('should re-render changeServiceUser with the error "Enter first Name" if firstName is null', async () => {
			const appealId = appealData.appealId;
			const invalidData = {
				firstName: null,
				lastName: 'Jones',
				emailAddress: 'null.jones@email.com'
			};
			const response = await request
				.post(`${baseUrl}/${appealId}/service-user/change/agent`)
				.send(invalidData);

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Enter first name');
			expect(element.innerHTML).toContain('govuk-error-summary');
		});
		it('should re-render changeServiceUser with the error "Enter first name" if firstName is empty', async () => {
			const appealId = appealData.appealId;
			const invalidData = {
				firstName: '',
				lastName: 'Jones',
				emailAddress: 'null.jones@email.com'
			};
			const response = await request
				.post(`${baseUrl}/${appealId}/service-user/change/agent`)
				.send(invalidData);

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Enter first name');
			expect(element.innerHTML).toContain('govuk-error-summary');
		});
		it('should re-render changeServiceUser with the error "Enter first name" if firstName is undefined', async () => {
			const appealId = appealData.appealId;
			const invalidData = {
				lastName: 'Jones',
				emailAddress: 'null.jones@email.com'
			};
			const response = await request
				.post(`${baseUrl}/${appealId}/service-user/change/agent`)
				.send(invalidData);

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Enter first name');
			expect(element.innerHTML).toContain('govuk-error-summary');
		});
		it('should re-render changeServiceUser with the error "Enter last name" if lastName is null', async () => {
			const appealId = appealData.appealId;
			const invalidData = {
				firstName: 'Jessica',
				lastName: null,
				emailAddress: 'jessica.null@email.com'
			};
			const response = await request
				.post(`${baseUrl}/${appealId}/service-user/change/agent`)
				.send(invalidData);

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Enter last name');
			expect(element.innerHTML).toContain('govuk-error-summary');
		});
		it('should re-render changeServiceUser with the error "Enter last name" if lastName is empty', async () => {
			const appealId = appealData.appealId;
			const invalidData = {
				firstName: 'Jessica',
				lastName: '',
				emailAddress: 'jessica.null@email.com'
			};
			const response = await request
				.post(`${baseUrl}/${appealId}/service-user/change/agent`)
				.send(invalidData);

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Enter last name');
			expect(element.innerHTML).toContain('govuk-error-summary');
		});
		it('should re-render changeServiceUser with the error "Enter last name" if lastName is undefined', async () => {
			const appealId = appealData.appealId;
			const invalidData = {
				firstName: 'Jessica',
				emailAddress: 'jessica.null@email.com'
			};
			const response = await request
				.post(`${baseUrl}/${appealId}/service-user/change/agent`)
				.send(invalidData);

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Enter last name');
			expect(element.innerHTML).toContain('govuk-error-summary');
		});
		it('should re-render changeServiceUser with the error "Enter a valid email" if email is not an email', async () => {
			const appealId = appealData.appealId;
			const invalidData = {
				firstName: 'Jessica',
				lastName: 'Jones',
				emailAddress: 'jessica.jones'
			};
			const response = await request
				.post(`${baseUrl}/${appealId}/service-user/change/agent`)
				.send(invalidData);

			expect(response.statusCode).toBe(200);

			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Enter a valid email');
			expect(element.innerHTML).toContain('govuk-error-summary');
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
			const response = await request
				.post(`${baseUrl}/${appealId}/service-user/change/agent`)
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
			const response = await request
				.post(`${baseUrl}/${appealId}/service-user/change/agent`)
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
			const response = await request
				.post(`${baseUrl}/${appealId}/appellant-case/service-user/change/agent`)
				.send(validData);

			expect(response.statusCode).toBe(302);
			expect(response.text).toBe(
				'Found. Redirecting to /appeals-service/appeal-details/1/appellant-case'
			);
		});
	});
});
