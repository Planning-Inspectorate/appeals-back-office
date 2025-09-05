import { azureAdUserId, representationRejectionReasons } from '#tests/shared/mocks.js';
import { ERROR_FAILED_TO_GET_DATA, ERROR_NOT_FOUND } from '@pins/appeals/constants/support.js';
import supertest from 'supertest';
import { app } from '../../../app-test.js';

const { databaseConnector } = await import('../../../utils/database-connector.js');
const request = supertest(app);

describe('representation rejection reasons routes', () => {
	describe('/appeals/representation-rejection-reasons', () => {
		describe('GET', () => {
			test('gets representation rejection reasons', async () => {
				// Mock the database connector to return mock rejection reasons
				// @ts-ignore
				databaseConnector.representationRejectionReason.findMany.mockResolvedValue(
					representationRejectionReasons
				);

				const response = await request
					.get('/appeals/representation-rejection-reasons')
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(200);
				expect(response.body).toEqual(representationRejectionReasons);
			});

			test('returns an error if representation rejection reasons are not found', async () => {
				// Mock the database connector to return an empty array
				// @ts-ignore
				databaseConnector.representationRejectionReason.findMany.mockResolvedValue([]);

				const response = await request
					.get('/appeals/representation-rejection-reasons')
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(404);
				expect(response.body).toEqual({ errors: ERROR_NOT_FOUND });
			});

			test('returns an error if unable to get representation rejection reasons', async () => {
				// Mock the database connector to throw an error
				// @ts-ignore
				databaseConnector.representationRejectionReason.findMany.mockImplementation(() => {
					throw new Error(ERROR_FAILED_TO_GET_DATA);
				});

				const response = await request
					.get('/appeals/representation-rejection-reasons')
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(500);
				expect(response.body).toEqual({ errors: ERROR_FAILED_TO_GET_DATA });
			});
		});
	});
});
