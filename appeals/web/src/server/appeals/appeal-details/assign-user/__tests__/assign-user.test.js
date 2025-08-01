import nock from 'nock';
import supertest from 'supertest';
import { jest } from '@jest/globals';
import { parseHtml } from '@pins/platform';
import { createTestEnvironment } from '#testing/index.js';
import usersService from '#appeals/appeal-users/users-service.js';
import { activeDirectoryUsersData } from '#testing/app/fixtures/referencedata.js';

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
	});
	afterEach(teardown);

	describe('GET /assign-case-officer/search-case-officer', () => {
		it('should render the search for case officer page with expected content', async () => {
			const response = await request.get(`${baseUrl}/assign-case-officer/search-case-officer`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Case officer</label></h1>');
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
			expect(element.innerHTML).toContain('Case officer</label></h1>');

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
			expect(element.innerHTML).toContain('Inspector</label></h1>');
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
			expect(element.innerHTML).toContain('Inspector</label></h1>');

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
			expect(unprettifiedElement.innerHTML).toContain(
				'assign-case-officer/search-case-officer">Change'
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
		// 	const response = await request
		// 		.post(`${baseUrl}/appellant-case/site-address/change/1`)
		// 		.send({
		// 			addressLine1: '1 Grove Cottage',
		// 			county: 'Devon',
		// 			postCode: 'NR35 2ND',
		// 			town: 'Woodton'
		// 		});

		// 	expect(response.statusCode).toBe(302);

		// 	const appellantCaseResponse = await request.get(`${baseUrl}/appeal-details`);
		// 	const notificationBannerElementHTML = parseHtml(appellantCaseResponse.text, {
		// 		rootElement: '.govuk-notification-banner'
		// 	}).innerHTML;

		// 	expect(notificationBannerElementHTML).toContain('Success</h3>');
		// 	expect(notificationBannerElementHTML).toContain('Case officer Assigned</p>');
		// });
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
			expect(unprettifiedElement.innerHTML).toContain('assign-inspector/search-inspector">Change');
			expect(unprettifiedElement.innerHTML).toContain('Assign inspector</button>');
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
	});
});
