import { request } from '#tests/../app-test.js';
import { azureAdUserId } from '#tests/shared/mocks.js';

const { databaseConnector } = await import('#utils/database-connector.js');

const caseTeam1 = {
	id: 1,
	email: 'test@example.com'
};

const caseTeam2 = {
	id: 2,
	email: 'test2@example.com'
};

describe('local-planning-authorities', () => {
	describe('GET /case-teams', () => {
		test('returns 200 when getting list of case teams', async () => {
			// @ts-ignore
			databaseConnector.caseTeam.findMany.mockResolvedValue([caseTeam1, caseTeam2]);

			const response = await request.get(`/appeals/case-teams`).set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(200);
			expect(databaseConnector.caseTeam.findMany).toHaveBeenCalledTimes(1);
			expect(response.body).toEqual([caseTeam1, caseTeam2]);
		});
	});
});
