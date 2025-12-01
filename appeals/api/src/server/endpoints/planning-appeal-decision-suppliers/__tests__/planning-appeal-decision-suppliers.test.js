// @ts-nocheck
import { request } from '#server/app-test.js';
import { azureAdUserId } from '#tests/shared/mocks.js';
import { jest } from '@jest/globals';

const { databaseConnector } = await import('#utils/database-connector.js');

const padOne = {
	id: 47,
	name: 'Tom Jack',
	sapId: '12345',
};

const padTwo = {
	id: 43,
	name: 'Tom Jackson',
	sapId: '12125'
};
jest.mock('#utils/database-connector.js', () => ({
	databaseConnector: { pADUsers: { findMany: jest.fn().mockResolvedValue([padOne, padTwo]) } }
}));
describe('planning-appeal-decision-suppliers', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});
	afterEach(() => {
		jest.clearAllMocks();
	});
	describe('GET /planning-appeal-decision-suppliers', () => {
		test('returns 200 with list of PAD users', async () => {
			// @ts-ignore
			console.log(Object.keys(databaseConnector));
			console.log(databaseConnector,'databaseConnector');
			// databaseConnector.pADUsers.findMany.mockResolvedValue([padOne, padTwo]);
			const response = await request
				.get(`/appeals/planning-appeal-decision-suppliers`).set('azureAdUserId', azureAdUserId);
			console.log(response.body,'response.body');
			expect(response.status).toEqual(200);
			expect(databaseConnector.pADUsers.findMany).toHaveBeenCalledTimes(1);
			expect(response.body).toEqual([padOne, padTwo]);
		});
	});


	describe('GET /planning-appeal-decision-suppliers/:sapId', () => {
		test('returns 200 with a PAD user', async () => {
			// @ts-ignore
			console.log(Object.keys(databaseConnector));
			console.log(databaseConnector, 'databaseConnector');
			databaseConnector.pADUsers.findUnique.mockResolvedValue(padOne);
			const response = await request
				.get(`/appeals/planning-appeal-decision-suppliers/12345`)
				.set('azureAdUserId', azureAdUserId);
			console.log(response.body, 'response.body');
			expect(response.status).toEqual(200);
			expect(databaseConnector.pADUsers.findUnique).toHaveBeenCalledTimes(1);
			expect(response.body).toEqual(padOne);
		});
	});
});
