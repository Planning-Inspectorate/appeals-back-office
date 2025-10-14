// @ts-nocheck
import { appealStatus, householdAppeal } from '#tests/appeals/mocks.js';
import { azureAdUserId } from '#tests/shared/mocks.js';
import { jest } from '@jest/globals';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import supertest from 'supertest';
import { app } from '../../../app-test.js';

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

	describe('/appeals/:appealId/appeal-status/:status/created-date', () => {
		describe('GET', () => {
			const appealId = 1;
			const status = APPEAL_CASE_STATUS.VALIDATION;

			test('returns 200 with created date for status and appeal', async () => {
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				databaseConnector.appealStatus.findFirst.mockResolvedValue(appealStatus);
				const expectedDate = { createdDate: '2050-01-01T00:00:00.000Z' };
				const response = await request
					.get(`/appeals/${appealId}/appeal-status/${status}/created-date`)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(200);
				expect(response.body).toEqual(expectedDate);
			});

			test('returns 404 when the appeal is not found for that appealId', async () => {
				databaseConnector.appeal.findUnique.mockResolvedValue({});

				const response = await request
					.get(`/appeals/${appealId}/appeal-status/${status}/created-date`)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(404);
			});

			test('returns 400 when the status is not part of accepted list', async () => {
				const invalidAppealStatus = 'STATUS_DOES_NOT_EXIST';
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

				const response = await request
					.get(`/appeals/${appealId}/appeal-status/${invalidAppealStatus}/created-date`)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
				expect(response.text).toEqual(
					'{"errors":{"status":"Must be one of the following values: assign_case_officer, awaiting_event, awaiting_transfer, closed, complete, event, evidence, final_comments, invalid, issue_determination, lpa_questionnaire, ready_to_start, statements, transferred, validation, withdrawn, witnesses"}}'
				);
			});

			test('should return an empty object if no status found for that appealId', async () => {
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				databaseConnector.appealStatus.findFirst.mockResolvedValue();

				const response = await request
					.get(`/appeals/${appealId}/appeal-status/${status}/created-date`)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(200);
				expect(response.body).toEqual({});
			});
		});
	});
});
