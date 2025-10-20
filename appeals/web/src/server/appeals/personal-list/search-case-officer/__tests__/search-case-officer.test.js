import usersService from '#appeals/appeal-users/users-service.js';
import { activeDirectoryUsersData } from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { jest } from '@jest/globals';
import { parseHtml } from '@pins/platform';
import supertest from 'supertest';

const { app, installMockApi, teardown } = createTestEnvironment();
const request = supertest(app);
const baseUrl = '/appeals-service/personal-list';

describe('search-case-officer', () => {
	beforeEach(() => {
		installMockApi();
		// @ts-ignore
		usersService.getUsersByRole = jest.fn().mockResolvedValue(activeDirectoryUsersData);
		// @ts-ignore
		usersService.getUserByRoleAndId = jest.fn().mockResolvedValue(activeDirectoryUsersData[0]);
	});
	afterEach(teardown);

	describe('GET /search-case-officer', () => {
		it('should render the search for case officer page with expected content', async () => {
			const response = await request.get(`${baseUrl}/search-case-officer`);
			const element = parseHtml(response.text);

			expect(element.innerHTML).toMatchSnapshot();
			expect(element.innerHTML).toContain('Case officer</label></h1>');
			expect(element.innerHTML).toContain('accessible-autocomplete" id="users" name="user"');
			expect(element.innerHTML).toContain('Continue</button>');
		});

		it('should re-render the search case officer page with the expected error message if a CO is not provided', async () => {
			const response = await request.post(`${baseUrl}/search-case-officer`).send({
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
	});
});
