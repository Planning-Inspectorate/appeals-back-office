import { appealTypes, azureAdUserId } from '#tests/shared/mocks.js';
import { ERROR_FAILED_TO_GET_DATA, ERROR_NOT_FOUND } from '@pins/appeals/constants/support.js';
import supertest from 'supertest';
import { app } from '../../../app-test.js';

const { databaseConnector } = await import('../../../utils/database-connector.js');
const request = supertest(app);

describe('appeal types routes', () => {
	describe('/appeals/appeal-types', () => {
		describe('GET', () => {
			test('gets appeal types', async () => {
				// @ts-ignore
				databaseConnector.appealType.findMany.mockResolvedValue(appealTypes);

				const response = await request
					.get('/appeals/appeal-types')
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(200);
				expect(response.body).toEqual(appealTypes);
			});

			test('gets appeal types that are active in CBOS if query parameter filterEnabled is true', async () => {
				// @ts-ignore
				databaseConnector.appealType.findMany.mockResolvedValue(appealTypes);

				const response = await request
					.get('/appeals/appeal-types')
					.query('filterEnabled=true')
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(200);
				expect(response.body).toEqual(appealTypes);
			});

			test('returns an error if appeal types are not found', async () => {
				// @ts-ignore
				databaseConnector.appealType.findMany.mockResolvedValue([]);

				const response = await request
					.get('/appeals/appeal-types')
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(404);
				expect(response.body).toEqual({ errors: ERROR_NOT_FOUND });
			});

			test('returns an error if unable to get appeal types', async () => {
				// @ts-ignore
				databaseConnector.appealType.findMany.mockImplementation(() => {
					throw new Error(ERROR_FAILED_TO_GET_DATA);
				});

				const response = await request
					.get('/appeals/appeal-types')
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(500);
				expect(response.body).toEqual({ errors: ERROR_FAILED_TO_GET_DATA });
			});
		});
	});
});
