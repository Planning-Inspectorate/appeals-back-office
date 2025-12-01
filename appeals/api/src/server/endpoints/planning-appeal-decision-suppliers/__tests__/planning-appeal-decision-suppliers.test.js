// @ts-nocheck
import { jest } from '@jest/globals';

const supertest = (await import('supertest')).default;
const { app } = await import('../../../app-test.js');
const { azureAdUserId } = await import('#tests/shared/mocks.js');

const { databaseConnector } = await import('#utils/database-connector.js');

const request = supertest(app);

const padsUserOne = { id: 47, name: 'Tom Jack', sapId: '12345' };
const padsUserTwo = { id: 43, name: 'Tom Jackson', sapId: '12125' };

describe('planning-appeal-decision-suppliers.routes', () => {
	beforeEach(() => jest.clearAllMocks());
	afterEach(() => jest.clearAllMocks());

	describe('GET /planning-appeal-decision-suppliers', () => {
		test('returns 200 when getting a list of PADS users', async () => {
			// @ts-ignore
			databaseConnector.pADSUser.findMany.mockResolvedValue([padsUserOne, padsUserTwo]);

			const response = await request
				.get(`/appeals/planning-appeal-decision-suppliers`)
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(200);
			expect(databaseConnector.pADSUser.findMany).toHaveBeenCalledTimes(1);
			expect(response.body).toEqual([padsUserOne, padsUserTwo]);
		});
	});

	describe('GET /planning-appeal-decision-suppliers/:sapId', () => {
		test('returns 200 with a PADS user', async () => {
			databaseConnector.pADSUser.findUnique.mockResolvedValue(padsUserOne);

			const response = await request
				.get('/appeals/planning-appeal-decision-suppliers/12345')
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(200);
			expect(databaseConnector.pADSUser.findUnique).toHaveBeenCalledTimes(1);
			expect(response.body).toEqual(padsUserOne);
		});
	});
});
