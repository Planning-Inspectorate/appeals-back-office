import {
	appellantCaseEnforcementGroundsMismatchFactsList,
	azureAdUserId
} from '#tests/shared/mocks.js';
import { ERROR_FAILED_TO_GET_DATA, ERROR_NOT_FOUND } from '@pins/appeals/constants/support.js';
import supertest from 'supertest';
import { app } from '../../../app-test.js';

const { databaseConnector } = await import('../../../utils/database-connector.js');
const request = supertest(app);

describe('appellant case enforcement ground mismatch facts routes', () => {
	describe('/appeals/appellant-case-enforcement-grounds-mismatch-facts', () => {
		describe('GET', () => {
			test('gets grounds list', async () => {
				// @ts-ignore
				databaseConnector.appellantCaseEnforcementGroundsMismatchFacts.findMany.mockResolvedValue(
					appellantCaseEnforcementGroundsMismatchFactsList
				);

				const response = await request
					.get('/appeals/appellant-case-enforcement-grounds-mismatch-facts')
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(200);
				expect(response.body).toEqual(appellantCaseEnforcementGroundsMismatchFactsList);
			});

			test('returns an error if appellant case enforcement grounds facts are not found', async () => {
				// @ts-ignore
				databaseConnector.appellantCaseEnforcementGroundsMismatchFacts.findMany.mockResolvedValue(
					[]
				);

				const response = await request
					.get('/appeals/appellant-case-enforcement-grounds-mismatch-facts')
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(404);
				expect(response.body).toEqual({ errors: ERROR_NOT_FOUND });
			});

			test('returns an error if unable to get appellant case enforcement grounds facts', async () => {
				// @ts-ignore
				databaseConnector.appellantCaseEnforcementGroundsMismatchFacts.findMany.mockImplementation(
					() => {
						throw new Error(ERROR_FAILED_TO_GET_DATA);
					}
				);

				const response = await request
					.get('/appeals/appellant-case-enforcement-grounds-mismatch-facts')
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(500);
				expect(response.body).toEqual({ errors: ERROR_FAILED_TO_GET_DATA });
			});
		});
	});
});
