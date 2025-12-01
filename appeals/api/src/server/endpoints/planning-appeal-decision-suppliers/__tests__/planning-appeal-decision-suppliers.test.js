// @ts-nocheck
import { jest } from '@jest/globals';

// create mock fns
const getLookupDataByValue = jest.fn();
const getLookupData = jest.fn();

// mock both likely specifiers to be safe

await jest.unstable_mockModule('#common/controllers/lookup-data.controller.js', () => ({
	getLookupData,
	getLookupDataByValue
}));
await jest.unstable_mockModule('#common/controllers/lookup-data.controller', () => ({
	getLookupData,
	getLookupDataByValue
}));

// now import everything dynamically so imports see the mock
const supertest = (await import('supertest')).default;
const { app } = await import('../../../app-test.js');
const lookupDataController = await import('#common/controllers/lookup-data.controller.js');
const { azureAdUserId } = await import('#tests/shared/mocks.js');

// ...existing code...
const request = supertest(app);

const padOne = { id: 47, name: 'Tom Jack', sapId: '12345' };
const padTwo = { id: 43, name: 'Tom Jackson', sapId: '12125' };

describe('planning-appeal-decision-suppliers.routes', () => {
	beforeEach(() => jest.clearAllMocks());
	afterEach(() => jest.clearAllMocks());

	describe('GET /planning-appeal-decision-suppliers', () => {
		test('returns 200 with a list of PAD users', async () => {
			lookupDataController.getLookupData.mockResolvedValue({ body: [padOne, padTwo] , status: 200 });

			const resp= await request
				.get('/appeals/planning-appeal-decision-suppliers')
				.set('azureAdUserId', azureAdUserId);
console.log(resp.body,'response body in test');
			expect(resp.status).toEqual(200);
			expect(lookupDataController.getLookupData).toHaveBeenCalledTimes(1);
			expect(lookupDataController.getLookupData).toHaveBeenCalledWith('PADUsers');
			expect(resp.body).toEqual([padOne, padTwo]);
		});
	});

	describe('GET /planning-appeal-decision-suppliers/:sapId', () => {
		test('returns 200 with a PAD user', async () => {
			lookupDataController.getLookupDataByValue.mockResolvedValue(padOne);

			const response = await request
				.get('/appeals/planning-appeal-decision-suppliers/12345')
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(200);
			expect(lookupDataController.getLookupDataByValue).toHaveBeenCalledTimes(1);
			expect(lookupDataController.getLookupDataByValue).toHaveBeenCalledWith('PADUsers', { key: 'sapId', value: '12345' });
			expect(response.body).toEqual(padOne);
		});
	});
});
