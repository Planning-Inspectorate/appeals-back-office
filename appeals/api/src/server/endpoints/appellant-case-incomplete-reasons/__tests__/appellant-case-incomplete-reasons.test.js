import supertest from 'supertest';
import { app } from '../../../app-test.js';
import { azureAdUserId, appellantCaseIncompleteReasons } from '#tests/shared/mocks.js';
import { ERROR_FAILED_TO_GET_DATA, ERROR_NOT_FOUND } from '@pins/appeals/constants/support.js';

const { databaseConnector } = await import('../../../utils/database-connector.js');
const request = supertest(app);

describe('appellant case incomplete reasons routes', () => {
	describe('/appeals/appellant-case-incomplete-reasons', () => {
		describe('GET', () => {
			test('gets appellant case incomplete reasons', async () => {
				// @ts-ignore
				databaseConnector.appellantCaseIncompleteReason.findMany.mockResolvedValue(
					appellantCaseIncompleteReasons
				);

				const response = await request
					.get('/appeals/appellant-case-incomplete-reasons')
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(200);
				expect(response.body).toEqual(appellantCaseIncompleteReasons);
			});

			test('returns an error if appellant case incomplete reasons are not found', async () => {
				// @ts-ignore
				databaseConnector.appellantCaseIncompleteReason.findMany.mockResolvedValue([]);

				const response = await request
					.get('/appeals/appellant-case-incomplete-reasons')
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(404);
				expect(response.body).toEqual({ errors: ERROR_NOT_FOUND });
			});

			test('returns an error if unable to get appellant case incomplete reasons', async () => {
				// @ts-ignore
				databaseConnector.appellantCaseIncompleteReason.findMany.mockImplementation(() => {
					throw new Error(ERROR_FAILED_TO_GET_DATA);
				});

				const response = await request
					.get('/appeals/appellant-case-incomplete-reasons')
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(500);
				expect(response.body).toEqual({ errors: ERROR_FAILED_TO_GET_DATA });
			});
		});
	});
});
