import { appellantCaseEnforcementInvalidReasons, azureAdUserId } from '#tests/shared/mocks.js';
import { ERROR_FAILED_TO_GET_DATA, ERROR_NOT_FOUND } from '@pins/appeals/constants/support.js';
import supertest from 'supertest';
import { app } from '../../../app-test.js';

const { databaseConnector } = await import('../../../utils/database-connector.js');
const request = supertest(app);

describe('appellant case enforcement invalid reasons routes', () => {
	describe('/appeals/appellant-case-enforcement-invalid-reasons', () => {
		describe('GET', () => {
			test('gets appellant case enforcement invalid reasons', async () => {
				// @ts-ignore
				databaseConnector.appellantCaseEnforcementInvalidReason.findMany.mockResolvedValue(
					appellantCaseEnforcementInvalidReasons
				);

				const response = await request
					.get('/appeals/appellant-case-enforcement-invalid-reasons')
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(200);
				expect(response.body).toEqual(appellantCaseEnforcementInvalidReasons);
			});

			test('returns an error if appellant case enforcement invalid reasons are not found', async () => {
				// @ts-ignore
				databaseConnector.appellantCaseEnforcementInvalidReason.findMany.mockResolvedValue([]);

				const response = await request
					.get('/appeals/appellant-case-enforcement-invalid-reasons')
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(404);
				expect(response.body).toEqual({ errors: ERROR_NOT_FOUND });
			});

			test('returns an error if unable to get appellant case enforcement invalid reasons', async () => {
				// @ts-ignore
				databaseConnector.appellantCaseEnforcementInvalidReason.findMany.mockImplementation(() => {
					throw new Error(ERROR_FAILED_TO_GET_DATA);
				});

				const response = await request
					.get('/appeals/appellant-case-enforcement-invalid-reasons')
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(500);
				expect(response.body).toEqual({ errors: ERROR_FAILED_TO_GET_DATA });
			});
		});
	});
});
