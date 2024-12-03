import supertest from 'supertest';
import { app } from '../../../app-test.js';
import { azureAdUserId, lpas } from '#tests/shared/mocks.js';
import { ERROR_FAILED_TO_GET_DATA, ERROR_NOT_FOUND } from '../../constants.js';

const { databaseConnector } = await import('../../../utils/database-connector.js');
const request = supertest(app);

describe('lpas routes', () => {
	describe('/appeals/lpas', () => {
		describe('GET', () => {
			test('gets lpas', async () => {
				// @ts-ignore
				databaseConnector.lPA.findMany.mockResolvedValue(lpas);

				const response = await request.get('/appeals/lpas').set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(200);
				expect(response.body).toEqual(lpas);
			});

			test('returns an error if lpas are not found', async () => {
				// @ts-ignore
				databaseConnector.lPA.findMany.mockResolvedValue([]);

				const response = await request.get('/appeals/lpas').set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(404);
				expect(response.body).toEqual({ errors: ERROR_NOT_FOUND });
			});

			test('returns an error if unable to get lpas', async () => {
				// @ts-ignore
				databaseConnector.lPA.findMany.mockImplementation(() => {
					throw new Error(ERROR_FAILED_TO_GET_DATA);
				});

				const response = await request.get('/appeals/lpas').set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(500);
				expect(response.body).toEqual({ errors: ERROR_FAILED_TO_GET_DATA });
			});
		});
	});
});
