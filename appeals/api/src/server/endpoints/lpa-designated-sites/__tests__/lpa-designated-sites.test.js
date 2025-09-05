import { azureAdUserId, lpaDesignatedSites } from '#tests/shared/mocks.js';
import { ERROR_FAILED_TO_GET_DATA, ERROR_NOT_FOUND } from '@pins/appeals/constants/support.js';
import supertest from 'supertest';
import { app } from '../../../app-test.js';

const { databaseConnector } = await import('../../../utils/database-connector.js');
const request = supertest(app);

describe('lpa designated sites routes', () => {
	describe('/appeals/lpa-designated-sites', () => {
		describe('GET', () => {
			test('gets designated sites', async () => {
				// @ts-ignore
				databaseConnector.designatedSite.findMany.mockResolvedValue(lpaDesignatedSites);

				const response = await request
					.get('/appeals/lpa-designated-sites')
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(200);
				expect(response.body).toEqual(lpaDesignatedSites);
			});

			test('returns an error if designated sites are not found', async () => {
				// @ts-ignore
				databaseConnector.designatedSite.findMany.mockResolvedValue([]);

				const response = await request
					.get('/appeals/lpa-designated-sites')
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(404);
				expect(response.body).toEqual({ errors: ERROR_NOT_FOUND });
			});

			test('returns an error if unable to get designated sites', async () => {
				// @ts-ignore
				databaseConnector.designatedSite.findMany.mockImplementation(() => {
					throw new Error(ERROR_FAILED_TO_GET_DATA);
				});

				const response = await request
					.get('/appeals/lpa-designated-sites')
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(500);
				expect(response.body).toEqual({ errors: ERROR_FAILED_TO_GET_DATA });
			});
		});
	});
});
