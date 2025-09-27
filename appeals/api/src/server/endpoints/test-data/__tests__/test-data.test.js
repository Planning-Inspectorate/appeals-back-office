// @ts-nocheck
import { azureAdUserId } from '#tests/shared/mocks.js';
import { jest } from '@jest/globals';
import express from 'express';
import supertest from 'supertest';
import { generateTestAppeals } from '../test-data.controller.js';
import { testDataService } from '../test-data.service.js';

const app = express();
app.get('/appeals/generate-appeals', generateTestAppeals);
const request = supertest(app);

describe('/appeals/generate-appeals', () => {
	beforeAll(() => {
		jest.spyOn(testDataService, 'generateAppeals').mockResolvedValue([
			{ id: 1, reference: 'FAKE-1', type: 'has', appellant: { email: 'load-test@example.com' } },
			{ id: 2, reference: 'FAKE-2', type: 'has', appellant: { email: 'load-test@example.com' } },
			{ id: 3, reference: 'FAKE-3', type: 'has', appellant: { email: 'load-test@example.com' } }
		]);
	});

	afterAll(() => {
		jest.restoreAllMocks();
	});

	it('GET creates the expected number of appeals', async () => {
		const response = await request
			.get('/appeals/generate-appeals?type=has&count=3')
			.set('azureAdUserId', azureAdUserId);

		expect(response.status).toEqual(200);
		expect(response.body.count).toEqual(3);
		expect(testDataService.generateAppeals).toHaveBeenCalledWith('has', 3, expect.any(Array));
	});
});
