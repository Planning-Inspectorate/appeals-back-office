import { azureAdUserId, grounds } from '#tests/shared/mocks.js';
import { ERROR_FAILED_TO_GET_DATA, ERROR_NOT_FOUND } from '@pins/appeals/constants/support.js';
import supertest from 'supertest';
import { app } from '../../../app-test.js';

const { databaseConnector } = await import('../../../utils/database-connector.js');
const request = supertest(app);

describe('grounds routes', () => {
	describe('/appeals/grounds', () => {
		describe('GET', () => {
			test('gets grounds', async () => {
				// @ts-ignore
				databaseConnector.ground.findMany.mockResolvedValue(grounds);

				const response = await request.get('/appeals/grounds').set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(200);
				expect(response.body).toEqual(grounds);
			});

			test('returns an error if grounds are not found', async () => {
				// @ts-ignore
				databaseConnector.ground.findMany.mockResolvedValue([]);

				const response = await request.get('/appeals/grounds').set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(404);
				expect(response.body).toEqual({ errors: ERROR_NOT_FOUND });
			});

			test('returns an error if unable to get grounds', async () => {
				// @ts-ignore
				databaseConnector.ground.findMany.mockImplementation(() => {
					throw new Error(ERROR_FAILED_TO_GET_DATA);
				});

				const response = await request.get('/appeals/grounds').set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(500);
				expect(response.body).toEqual({ errors: ERROR_FAILED_TO_GET_DATA });
			});
		});
	});
});
