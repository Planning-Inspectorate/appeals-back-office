// @ts-nocheck
import { request } from '#tests/../app-test.js';
import { jest } from '@jest/globals';
import { azureAdUserId } from '#tests/shared/mocks.js';
import { caseTeams } from '#tests/appeals/mocks.js';
const { databaseConnector } = await import('#utils/database-connector.js');

describe('case team routes', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});
	describe('GET', () => {
		describe('case-teams', () => {
			it('returns empty object when there are no teams', async () => {
				databaseConnector.team.findMany.mockResolvedValue({});

				const response = await request
					.get(`/appeals/case-teams`)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(200);
				expect(response.body).toEqual({});
			});

			it('should return an array of case teams when case teams found', async () => {
				databaseConnector.team.findMany.mockResolvedValue(caseTeams);

				const response = await request
					.get(`/appeals/case-teams`)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(200);
				expect(response.body).toEqual(caseTeams);
			});
		});
	});
});
