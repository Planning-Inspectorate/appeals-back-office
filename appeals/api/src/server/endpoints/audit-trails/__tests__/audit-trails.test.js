import { auditTrails, householdAppeal } from '#tests/appeals/mocks.js';
import { azureAdUserId } from '#tests/shared/mocks.js';
import { jest } from '@jest/globals';
import supertest from 'supertest';
import { app } from '../../../app-test.js';

const { databaseConnector } = await import('#utils/database-connector.js');
const request = supertest(app);

describe('audit trails routes', () => {
	beforeEach(() => {
		// @ts-ignore
		databaseConnector.appealRelationship.findMany.mockResolvedValue([]);
	});
	afterEach(() => {
		jest.clearAllMocks();
	});
	describe('/appeals/:appealId/audit-trails', () => {
		describe('GET', () => {
			test('gets audit trail entries', async () => {
				// @ts-ignore
				databaseConnector.auditTrail.findMany.mockResolvedValue(auditTrails);

				const { id } = householdAppeal;
				const response = await request
					.get(`/appeals/${id}/audit-trails`)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(200);
				const expectedResponse = auditTrails.map((trail) => ({
					azureAdUserId: trail.user.azureAdUserId,
					details: trail.details,
					loggedDate: trail.loggedAt
				}));

				expect(response.body).toEqual(expectedResponse);
			});

			test('returns an empty array if audit trail entries are not found', async () => {
				// @ts-ignore
				databaseConnector.auditTrail.findMany.mockResolvedValue([]);

				const { id } = householdAppeal;
				const response = await request
					.get(`/appeals/${id}/audit-trails`)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(200);
				expect(response.body).toEqual([]);
			});
		});
	});
});
