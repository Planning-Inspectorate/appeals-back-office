// @ts-nocheck
import usersService from '#appeals/appeal-users/users-service.js';
import {
	activeDirectoryUsersData,
	appealData,
	caseNotes
} from '#testing/app/fixtures/referencedata.js';
import { createTestEnvironment } from '#testing/index.js';
import { jest } from '@jest/globals';
import nock from 'nock';
import supertest from 'supertest';

describe('appeal-details access control', () => {
	const baseUrl = '/appeals-service/appeal-details';
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
		// @ts-ignore
		usersService.getUsersByRole = jest.fn().mockResolvedValue(activeDirectoryUsersData);
		// @ts-ignore
		usersService.getUserById = jest.fn().mockResolvedValue(activeDirectoryUsersData[0]);
		// @ts-ignore
		usersService.getUserByRoleAndId = jest.fn().mockResolvedValue(activeDirectoryUsersData[0]);

		nock('http://test/')
			.get(/appeals\/\d+\/appellant-cases\/\d+/)
			.reply(200, { planningObligation: { hasObligation: false } })
			.persist();
	});

	afterEach(() => {
		teardownDev();
		teardownNonDev();
	});

	describe('System test LPA access restrictions', () => {
		describe('when appeal has Q9999 LPA code', () => {
			const appealWithQ9999Lpa = {
				...appealData,
				appealId: 100,
				lpaCode: 'Q9999'
			};

			it('should allow dev users to access the appeal', async () => {
				nock('http://test/')
					.get(`/appeals/${appealWithQ9999Lpa.appealId}?include=all`)
					.reply(200, appealWithQ9999Lpa);
				nock('http://test/')
					.get(`/appeals/${appealWithQ9999Lpa.appealId}/case-notes`)
					.reply(200, caseNotes);

				const response = await devRequest.get(`${baseUrl}/${appealWithQ9999Lpa.appealId}`);

				expect(response.statusCode).toBe(200);
			});

			it('should return 403 for non-dev users trying to access the appeal', async () => {
				nock('http://test/')
					.get(`/appeals/${appealWithQ9999Lpa.appealId}?include=all`)
					.reply(200, appealWithQ9999Lpa);

				const response = await nonDevRequest.get(`${baseUrl}/${appealWithQ9999Lpa.appealId}`);

				expect(response.statusCode).toBe(403);
			});
		});

		describe('when appeal has Q1111 LPA code', () => {
			const appealWithQ1111Lpa = {
				...appealData,
				appealId: 101,
				lpaCode: 'Q1111'
			};

			it('should allow dev users to access the appeal', async () => {
				nock('http://test/')
					.get(`/appeals/${appealWithQ1111Lpa.appealId}?include=all`)
					.reply(200, appealWithQ1111Lpa);
				nock('http://test/')
					.get(`/appeals/${appealWithQ1111Lpa.appealId}/case-notes`)
					.reply(200, caseNotes);

				const response = await devRequest.get(`${baseUrl}/${appealWithQ1111Lpa.appealId}`);

				expect(response.statusCode).toBe(200);
			});

			it('should return 403 for non-dev users trying to access the appeal', async () => {
				nock('http://test/')
					.get(`/appeals/${appealWithQ1111Lpa.appealId}?include=all`)
					.reply(200, appealWithQ1111Lpa);

				const response = await nonDevRequest.get(`${baseUrl}/${appealWithQ1111Lpa.appealId}`);

				expect(response.statusCode).toBe(403);
			});
		});

		describe('when appeal has a regular (non-test) LPA code', () => {
			const appealWithRegularLpa = {
				...appealData,
				appealId: 102,
				lpaCode: 'Q3101'
			};

			it('should allow dev users to access the appeal', async () => {
				nock('http://test/')
					.get(`/appeals/${appealWithRegularLpa.appealId}?include=all`)
					.reply(200, appealWithRegularLpa);
				nock('http://test/')
					.get(`/appeals/${appealWithRegularLpa.appealId}/case-notes`)
					.reply(200, caseNotes);

				const response = await devRequest.get(`${baseUrl}/${appealWithRegularLpa.appealId}`);

				expect(response.statusCode).toBe(200);
			});

			it('should allow non-dev users to access the appeal', async () => {
				nock('http://test/')
					.get(`/appeals/${appealWithRegularLpa.appealId}?include=all`)
					.reply(200, appealWithRegularLpa);
				nock('http://test/')
					.get(`/appeals/${appealWithRegularLpa.appealId}/case-notes`)
					.reply(200, caseNotes);

				const response = await nonDevRequest.get(`${baseUrl}/${appealWithRegularLpa.appealId}`);

				expect(response.statusCode).toBe(200);
			});
		});

		describe('when appeal has no LPA code', () => {
			const appealWithNoLpaCode = {
				...appealData,
				appealId: 103,
				lpaCode: null
			};

			it('should allow dev users to access the appeal', async () => {
				nock('http://test/')
					.get(`/appeals/${appealWithNoLpaCode.appealId}?include=all`)
					.reply(200, appealWithNoLpaCode);
				nock('http://test/')
					.get(`/appeals/${appealWithNoLpaCode.appealId}/case-notes`)
					.reply(200, caseNotes);

				const response = await devRequest.get(`${baseUrl}/${appealWithNoLpaCode.appealId}`);

				expect(response.statusCode).toBe(200);
			});

			it('should allow non-dev users to access the appeal', async () => {
				nock('http://test/')
					.get(`/appeals/${appealWithNoLpaCode.appealId}?include=all`)
					.reply(200, appealWithNoLpaCode);
				nock('http://test/')
					.get(`/appeals/${appealWithNoLpaCode.appealId}/case-notes`)
					.reply(200, caseNotes);

				const response = await nonDevRequest.get(`${baseUrl}/${appealWithNoLpaCode.appealId}`);

				expect(response.statusCode).toBe(200);
			});
		});
	});
});
