import usersService from '#appeals/appeal-users/users-service.js';
import { activeDirectoryUsersData } from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { jest } from '@jest/globals';
import { parseHtml } from '@pins/platform';
import nock from 'nock';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/appeal-details/1';

describe('assign-user', () => {
	beforeEach(() => {
		installMockApi();

		// @ts-ignore
		usersService.getUsersByRole = jest.fn().mockResolvedValue(activeDirectoryUsersData);
		// @ts-ignore
		usersService.getUserByRoleAndId = jest.fn().mockResolvedValue(activeDirectoryUsersData[0]);
		// @ts-ignore
		usersService.getUserById = jest.fn().mockResolvedValue(activeDirectoryUsersData[0]);
	});
	afterEach(teardown);

	describe('GET /assign-case-officer/search-case-officer', () => {
		it('should render the search for case officer page with expected content', async () => {
			const response = await request.get(`${baseUrl}/assign-case-officer/search-case-officer`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Find a case officer</label></h1>');
			expect(element.innerHTML).toContain('accessible-autocomplete" id="users" name="user"');
			expect(element.innerHTML).toContain('Continue</button>');
		});
	});

	describe('POST /assign-case-officer/search-case-officer', () => {
		it('should re-render the assign case officer page with the expected error message if a user is not provided', async () => {
			const response = await request
				.post(`${baseUrl}/assign-case-officer/search-case-officer`)
				.send({
					user: ''
				});
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Find a case officer</label></h1>');

			const unprettifiedErrorSummaryHTML = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(unprettifiedErrorSummaryHTML).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHTML).toContain('Enter a case officer</a>');
		});

		it('should save user to the session and redirect to check details page if user selected', async () => {
			const response = await request
				.post(`${baseUrl}/assign-case-officer/search-case-officer`)
				.send({
					user: '{"id": "923ac03b-9031-4cf4-8b17-348c274321f9", "name": "Smith, John", "email": "John.Smith@planninginspectorate.gov.uk"}'
				});

			expect(response.statusCode).toBe(302);
			expect(response.text).toEqual(
				'Found. Redirecting to /appeals-service/appeal-details/1/assign-case-officer/check-details'
			);
		});
	});

	describe('GET /assign-inspector/search-inspector', () => {
		it('should render the search for inspector page with expected content', async () => {
			const response = await request.get(`${baseUrl}/assign-inspector/search-inspector`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Find an inspector</label></h1>');
			expect(element.innerHTML).toContain('accessible-autocomplete" id="users" name="user"');
			expect(element.innerHTML).toContain('Continue</button>');
		});
	});

	describe('POST /assign-inspector/search-inspector', () => {
		it('should re-render the assign inspector page with the expected error message if a user is not provided', async () => {
			const response = await request.post(`${baseUrl}/assign-inspector/search-inspector`).send({
				user: ''
			});
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Find an inspector</label></h1>');

			const unprettifiedErrorSummaryHTML = parseHtml(response.text, {
				rootElement: '.govuk-error-summary',
				skipPrettyPrint: true
			}).innerHTML;

			expect(unprettifiedErrorSummaryHTML).toContain('There is a problem</h2>');
			expect(unprettifiedErrorSummaryHTML).toContain('Enter an inspector</a>');
		});

		it('should save user to the session and redirect to check details page if user selected', async () => {
			const response = await request
				.post(`${baseUrl}/assign-case-officer/search-case-officer`)
				.send({
					user: '{"id": "923ac03b-9031-4cf4-8b17-348c274321f9", "name": "Smith, John", "email": "John.Smith@planninginspectorate.gov.uk"}'
				});

			expect(response.statusCode).toBe(302);
			expect(response.text).toEqual(
				'Found. Redirecting to /appeals-service/appeal-details/1/assign-case-officer/check-details'
			);
		});
	});

	describe('GET /assign-case-officer/check-details', () => {
		it('should render the case officer check details page', async () => {
			await request.post(`${baseUrl}/assign-inspector/search-inspector`).send({
				user: '{"id": "923ac03b-9031-4cf4-8b17-348c274321f9", "name": "Smith, John", "email": "John.Smith@planninginspectorate.gov.uk"}'
			});
			const response = await request.get(`${baseUrl}/assign-case-officer/check-details`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Check details and assign case officer</h1>');

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'class="govuk-summary-list__key"> Case officer</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Smith, John');
			expect(unprettifiedElement.innerHTML).toContain(
				'<br>John.Smith@planninginspectorate.gov.uk</dd>'
			);

			expect(unprettifiedElement.innerHTML).toContain('Assign case officer</button>');
		});
	});

	describe('POST /assign-case-officer/check-details', () => {
		it('should redirect to the case details page when user clicks on "Assign case officer"', async () => {
			nock('http://test/').patch('/appeals/1').reply(200, { caseOfficer: 'updatedCaseOfficerId' });
			await request.post(`${baseUrl}/assign-inspector/search-inspector`).send({
				user: '{"id": "923ac03b-9031-4cf4-8b17-348c274321f9", "name": "Smith, John", "email": "John.Smith@planninginspectorate.gov.uk"}'
			});
			const response = await request.post(`${baseUrl}/assign-case-officer/check-details`).send();

			expect(response.statusCode).toBe(302);
			expect(response.text).toEqual('Found. Redirecting to /appeals-service/appeal-details/1');
		});
	});

	describe('GET /assign-inspector/check-details', () => {
		it('should render the inspector check details page', async () => {
			await request.post(`${baseUrl}/assign-inspector/search-inspector`).send({
				user: '{"id": "923ac03b-9031-4cf4-8b17-348c274321f9", "name": "Smith, John", "email": "John.Smith@planninginspectorate.gov.uk"}'
			});
			const response = await request.get(`${baseUrl}/assign-inspector/check-details`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Check details and assign inspector</h1>');

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'class="govuk-summary-list__key"> Inspector</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Smith, John');
			expect(unprettifiedElement.innerHTML).toContain(
				'<br>John.Smith@planninginspectorate.gov.uk</dd>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Assign inspector</button>');
		});

		it('should render the unassign inspector check details page', async () => {
			await request.post(`${baseUrl}/assign-inspector/search-inspector`).send({
				user: '{"id": 0, "name": "Unassign", "email": "Unassign"}'
			});
			const response = await request.get(`${baseUrl}/assign-inspector/check-details`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Check details and unassign inspector</h1>');

			const unprettifiedElement = parseHtml(response.text, { skipPrettyPrint: true });

			expect(unprettifiedElement.innerHTML).toContain(
				'class="govuk-summary-list__key"> Inspector</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Not assigned');
			expect(unprettifiedElement.innerHTML).toContain(
				'<br>This will remove the current case inspector from the appeal</dd>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Remove inspector</button>');
		});
	});

	describe('POST /assign-inspector/check-details', () => {
		it('should redirect to the case details page when user clicks on "Assign inspector"', async () => {
			nock('http://test/').patch('/appeals/1').reply(200, { caseOfficer: 'updatedCaseOfficerId' });
			await request.post(`${baseUrl}/assign-inspector/search-inspector`).send({
				user: '{"id": "923ac03b-9031-4cf4-8b17-348c274321f9", "name": "Smith, John", "email": "John.Smith@planninginspectorate.gov.uk"}'
			});
			const response = await request.post(`${baseUrl}/assign-inspector/check-details`).send();

			expect(response.statusCode).toBe(302);
			expect(response.text).toEqual('Found. Redirecting to /appeals-service/appeal-details/1');
		});

		it('should redirect to the case details page when user clicks on "Unassign inspector"', async () => {
			nock('http://test/').patch('/appeals/1').reply(200, { caseOfficer: 'updatedCaseOfficerId' });
			await request.post(`${baseUrl}/assign-inspector/search-inspector`).send({
				user: '{"id": 0, "name": "Remove", "email": "Remove"}'
			});
			const response = await request.post(`${baseUrl}/assign-inspector/check-details`).send();

			expect(response.statusCode).toBe(302);
			expect(response.text).toEqual('Found. Redirecting to /appeals-service/appeal-details/1');
		});

		it('should contain the correct back link url if searching for inspector"', async () => {
			await request.post(`${baseUrl}/assign-inspector/search-inspector`).send({
				user: '{"id": "923ac03b-9031-4cf4-8b17-348c274321f9", "name": "Smith, John", "email": "John.Smith@planninginspectorate.gov.uk"}'
			});
			const response = await request.get(`${baseUrl}/assign-inspector/check-details`);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Check details and assign inspector</h1>');
			const unprettifiedElement = parseHtml(response.text, {
				skipPrettyPrint: true
			});
			const unprettifiedBodyElement = parseHtml(response.text, {
				rootElement: 'body',
				skipPrettyPrint: false
			});
			expect(unprettifiedElement.innerHTML).toContain(
				'class="govuk-summary-list__key"> Inspector</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Smith, John');

			expect(unprettifiedBodyElement.innerHTML).toContain(
				`<a href="${baseUrl}/assign-inspector/search-inspector"`
			);

			expect(unprettifiedElement.innerHTML).toContain(
				'<br>John.Smith@planninginspectorate.gov.uk</dd>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Assign inspector</button>');
		});

		it('should contain the correct back link url if searching for case officer"', async () => {
			await request.post(`${baseUrl}/assign-case-officer/search-case-officer`).send({
				user: '{"id": "923ac03b-9031-4cf4-8b17-348c274321f9", "name": "Smith, John", "email": "John.Smith@planninginspectorate.gov.uk"}'
			});
			const response = await request.get(`${baseUrl}/assign-case-officer/check-details`);
			const element = parseHtml(response.text);
			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Check details and assign case officer</h1>');
			const unprettifiedElement = parseHtml(response.text, {
				skipPrettyPrint: true
			});
			const unprettifiedBodyElement = parseHtml(response.text, {
				rootElement: 'body',
				skipPrettyPrint: true
			});
			expect(unprettifiedElement.innerHTML).toContain(
				'class="govuk-summary-list__key"> Case officer</dt>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Smith, John');

			expect(unprettifiedBodyElement.innerHTML).toContain(
				`<a href="${baseUrl}/assign-case-officer/search-case-officer"`
			);

			expect(unprettifiedElement.innerHTML).toContain(
				'<br>John.Smith@planninginspectorate.gov.uk</dd>'
			);
			expect(unprettifiedElement.innerHTML).toContain('Assign case officer</button>');
		});
	});
});
