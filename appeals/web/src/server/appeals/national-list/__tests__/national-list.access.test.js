// @ts-nocheck
import usersService from '#appeals/appeal-users/users-service.js';
import {
	activeDirectoryUsersData,
	appealsNationalList,
	appealTypesData,
	caseTeams,
	procedureTypesData
} from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { jest } from '@jest/globals';
import nock from 'nock';
import supertest from 'supertest';

describe('national-list test LPA filtering', () => {
	const baseUrl = '/appeals-service/all-cases';

	const {
		app: devApp,
		installMockApi: installDevMockApi,
		teardown: teardownDev
	} = createTestEnvironment({
		groups: ['appeals_case_officer', 'appeals_inspector', 'dev']
	});
	const devRequest = supertest(devApp);

	const {
		app: nonDevApp,
		installMockApi: installNonDevMockApi,
		teardown: teardownNonDev
	} = createTestEnvironment({
		groups: ['appeals_case_officer', 'appeals_inspector']
	});
	const nonDevRequest = supertest(nonDevApp);

	beforeAll(() => {
		teardownDev();
		teardownNonDev();
	});

	beforeEach(() => {
		installDevMockApi();
		installNonDevMockApi();

		nock('http://test/').get('/appeals/appeal-types').reply(200, appealTypesData).persist();
		nock('http://test/').get('/appeals/case-teams').reply(200, caseTeams).persist();
		nock('http://test/').get('/appeals/procedure-types').reply(200, procedureTypesData).persist();

		// @ts-ignore
		usersService.getUserById = jest
			.fn()
			.mockImplementation((id) => activeDirectoryUsersData.find((user) => user.id === id));
	});

	afterEach(() => {
		teardownDev();
		teardownNonDev();
	});

	describe('System test LPA exclusion', () => {
		it('should NOT include excludeLpaCode parameter in API call for dev users', async () => {
			const apiCall = nock('http://test/')
				.get('/appeals?pageNumber=1&pageSize=30')
				.reply(200, appealsNationalList);

			const response = await devRequest.get(baseUrl);

			expect(response.statusCode).toBe(200);
			expect(apiCall.isDone()).toBe(true);
		});

		it('should include excludeLpaCode parameter with Q9999,Q1111 in API call for non-dev users', async () => {
			const apiCall = nock('http://test/')
				.get('/appeals?pageNumber=1&pageSize=30&excludeLpaCode=Q9999,Q1111')
				.reply(200, appealsNationalList);

			const response = await nonDevRequest.get(baseUrl);

			expect(response.statusCode).toBe(200);
			expect(apiCall.isDone()).toBe(true);
		});

		it('should still include excludeLpaCode for non-dev users when applying other filters', async () => {
			const apiCall = nock('http://test/')
				.get(
					'/appeals?pageNumber=1&pageSize=30&status=lpa_questionnaire&excludeLpaCode=Q9999,Q1111'
				)
				.reply(200, appealsNationalList);

			const response = await nonDevRequest.get(`${baseUrl}?appealStatusFilter=lpa_questionnaire`);

			expect(response.statusCode).toBe(200);
			expect(apiCall.isDone()).toBe(true);
		});

		it('should allow dev users to filter by test LPA code Q9999', async () => {
			const apiCall = nock('http://test/')
				.get('/appeals?pageNumber=1&pageSize=30&lpaCode=Q9999')
				.reply(200, appealsNationalList);

			const response = await devRequest.get(`${baseUrl}?localPlanningAuthorityFilter=Q9999`);

			expect(response.statusCode).toBe(200);
			expect(apiCall.isDone()).toBe(true);
		});

		it('should filter out test LPA codes when non-dev user tries to filter by Q9999', async () => {
			const apiCall = nock('http://test/')
				.get('/appeals?pageNumber=1&pageSize=30&excludeLpaCode=Q9999,Q1111')
				.reply(200, appealsNationalList);

			const response = await nonDevRequest.get(`${baseUrl}?localPlanningAuthorityFilter=Q9999`);

			expect(response.statusCode).toBe(200);
			expect(apiCall.isDone()).toBe(true);
		});

		it('should filter out test LPA codes when non-dev user tries to filter by Q1111', async () => {
			const apiCall = nock('http://test/')
				.get('/appeals?pageNumber=1&pageSize=30&excludeLpaCode=Q9999,Q1111')
				.reply(200, appealsNationalList);

			const response = await nonDevRequest.get(`${baseUrl}?localPlanningAuthorityFilter=Q1111`);

			expect(response.statusCode).toBe(200);
			expect(apiCall.isDone()).toBe(true);
		});

		it('should allow non-dev users to filter by regular LPA code while still excluding test LPAs', async () => {
			const apiCall = nock('http://test/')
				.get('/appeals?pageNumber=1&pageSize=30&lpaCode=Q3101&excludeLpaCode=Q9999,Q1111')
				.reply(200, appealsNationalList);

			const response = await nonDevRequest.get(`${baseUrl}?localPlanningAuthorityFilter=Q3101`);

			expect(response.statusCode).toBe(200);
			expect(apiCall.isDone()).toBe(true);
		});

		it('should handle mixed LPA filter with test and regular LPAs for non-dev users', async () => {
			// If user filters by "Q9999,Q3101", only Q3101 should be used
			const apiCall = nock('http://test/')
				.get('/appeals?pageNumber=1&pageSize=30&lpaCode=Q3101&excludeLpaCode=Q9999,Q1111')
				.reply(200, appealsNationalList);

			const response = await nonDevRequest.get(
				`${baseUrl}?localPlanningAuthorityFilter=Q9999,Q3101`
			);

			expect(response.statusCode).toBe(200);
			expect(apiCall.isDone()).toBe(true);
		});

		it('should include search term along with excludeLpaCode for non-dev users', async () => {
			const apiCall = nock('http://test/')
				.get('/appeals?pageNumber=1&pageSize=30&searchTerm=BS7%208LQ&excludeLpaCode=Q9999,Q1111')
				.reply(200, appealsNationalList);

			const response = await nonDevRequest.get(`${baseUrl}?searchTerm=BS7%208LQ`);

			expect(response.statusCode).toBe(200);
			expect(apiCall.isDone()).toBe(true);
		});
	});
});
