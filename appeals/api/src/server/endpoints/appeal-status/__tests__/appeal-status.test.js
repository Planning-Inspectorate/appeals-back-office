// @ts-nocheck
import supertest from 'supertest';
import { app } from '../../../app-test.js';
import { azureAdUserId } from '#tests/shared/mocks.js';
import { householdAppeal } from '#tests/appeals/mocks.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import { jest } from '@jest/globals';

const { databaseConnector } = await import('#utils/database-connector.js');
const request = supertest(app);

describe('appeal status routes', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('/appeals/:appealId/appeal-status/roll-back', () => {
		describe('POST', () => {
			const appealId = 1;
			const status = APPEAL_CASE_STATUS.VALIDATION;

			test('successfully rolls back appeal status', async () => {
				const mockAppealStatus = {
					id: 1,
					appealId: 1,
					status: APPEAL_CASE_STATUS.VALIDATION,
					createdAt: new Date('2024-01-01T00:00:00.000Z'),
					valid: true
				};

				// Mock the appeal exists check
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				// Mock the repository method
				databaseConnector.$transaction = jest.fn().mockImplementation(async (callback) => {
					// Mock the transaction callback execution
					const mockTx = {
						appealStatus: {
							findFirst: jest.fn().mockResolvedValue(mockAppealStatus),
							deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
							update: jest.fn().mockResolvedValue(mockAppealStatus)
						}
					};
					return await callback(mockTx);
				});

				const response = await request
					.post(`/appeals/${appealId}/appeal-status/roll-back`)
					.send({ status })
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(200);
				expect(response.body).toEqual({
					...mockAppealStatus,
					createdAt: '2024-01-01T00:00:00.000Z'
				});
			});

			test('returns 400 when appeal status not found for rollback', async () => {
				// Mock the appeal exists check
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				// Mock the repository method to throw error
				databaseConnector.$transaction = jest.fn().mockImplementation(async (callback) => {
					const mockTx = {
						appealStatus: {
							findFirst: jest.fn().mockResolvedValue(null)
						}
					};
					return await callback(mockTx);
				});

				const response = await request
					.post(`/appeals/${appealId}/appeal-status/roll-back`)
					.send({ status })
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.body).toEqual({
					error: `Appeal status ${status} not found for appeal ${appealId}`
				});
			});

			test('returns 500 when repository throws unknown exception', async () => {
				// Mock the appeal exists check
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				// Mock the repository method to throw unknown exception
				databaseConnector.$transaction = jest.fn().mockImplementation(() => {
					throw 'Unknown error';
				});

				const response = await request
					.post(`/appeals/${appealId}/appeal-status/roll-back`)
					.send({ status })
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(500);
				expect(response.body).toEqual({
					error: 'Failed to roll back appeal status'
				});
			});

			test('returns 400 when appealId is not numeric', async () => {
				const response = await request
					.post('/appeals/abc/appeal-status/roll-back')
					.send({ status })
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
			});

			test('returns 400 when status is missing from request body', async () => {
				const response = await request
					.post(`/appeals/${appealId}/appeal-status/roll-back`)
					.send({})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
			});

			test('returns 400 when status is empty string', async () => {
				const response = await request
					.post(`/appeals/${appealId}/appeal-status/roll-back`)
					.send({ status: '' })
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
			});

			test('returns 404 when appeal does not exist', async () => {
				databaseConnector.appeal.findUnique.mockResolvedValue(null);

				const response = await request
					.post(`/appeals/${appealId}/appeal-status/roll-back`)
					.send({ status })
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(404);
			});

			test('returns 400 when azureAdUserId header is missing', async () => {
				const response = await request
					.post(`/appeals/${appealId}/appeal-status/roll-back`)
					.send({ status });

				expect(response.status).toEqual(400);
			});
		});
	});
});
