// @ts-nocheck
import { request } from '#tests/../app-test.js';
import { jest } from '@jest/globals';
import { azureAdUserId } from '#tests/shared/mocks.js';
import { householdAppeal } from '#tests/appeals/mocks.js';
import { ERROR_MUST_BE_NUMBER } from '@pins/appeals/constants/support.js';
import { ERROR_NOT_FOUND } from '@pins/appeals/constants/support.js';

const { databaseConnector } = await import('#utils/database-connector.js');

const validLPA = {
	id: 47,
	name: 'Dorset Council',
	lpaCode: 'DORS',
	email: 'test@example.com'
};

const newLPA = {
	id: 48,
	name: 'Test Council',
	lpaCode: 'TEST',
	email: 'test2@example.com'
};

describe('local-planning-authorities', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});
	describe('GET /local-planning-authorities', () => {
		test('returns 200 when getting list of LPAs', async () => {
			// @ts-ignore
			databaseConnector.lPA.findMany.mockResolvedValue([validLPA, newLPA]);

			const response = await request
				.get(`/appeals/local-planning-authorities`)
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(200);
			expect(databaseConnector.lPA.findMany).toHaveBeenCalledTimes(1);
			expect(response.body).toEqual([validLPA, newLPA]);
		});
	});

	describe('GET /:appealId/lpa', () => {
		test('returns 200 when retrieving valid LPA', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			// @ts-ignore
			databaseConnector.lPA.findUnique.mockResolvedValue(validLPA);

			const response = await request
				.get(`/appeals/${householdAppeal.id}/lpa`)
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(200);
			expect(databaseConnector.lPA.findUnique).toHaveBeenCalledTimes(1);
			expect(response.body).toEqual(validLPA);
		});

		test('returns 400 if invalid appeal ID', async () => {
			const response = await request
				.get(`/appeals/notvalid/lpa`)
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(400);
			expect(databaseConnector.lPA.findUnique).toHaveBeenCalledTimes(0);
			expect(response.body).toEqual({ errors: { appealId: ERROR_MUST_BE_NUMBER } });
		});

		test('returns 404 if no LPA found', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			// @ts-ignore
			databaseConnector.lPA.findUnique.mockResolvedValue(null);

			const response = await request
				.get(`/appeals/${householdAppeal.id}/lpa`)
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(404);
			expect(databaseConnector.lPA.findUnique).toHaveBeenCalledTimes(1);
			expect(response.body).toEqual({});
		});
	});

	describe('POST /:appealId/lpa', () => {
		test('returns 200 if valid request', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			// @ts-ignore
			databaseConnector.lPA.findMany.mockResolvedValue([validLPA, newLPA]);

			const response = await request
				.post(`/appeals/${householdAppeal.id}/lpa`)
				.send({
					newLpaId: 48
				})
				.set('azureAdUserId', azureAdUserId);

			expect(databaseConnector.appeal.update).toHaveBeenCalledWith({
				data: {
					lpaId: 48,
					caseUpdatedDate: expect.any(Date)
				},
				where: {
					id: householdAppeal.id
				}
			});

			expect(response.status).toEqual(200);
		});

		test('returns 400 if invalid request', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			// @ts-ignore
			databaseConnector.lPA.findMany.mockResolvedValue([validLPA, newLPA]);

			const response = await request
				.post(`/appeals/${householdAppeal.id}/lpa`)
				.send({
					newLpaId: 'some invalid text'
				})
				.set('azureAdUserId', azureAdUserId);

			expect(databaseConnector.appeal.update).not.toHaveBeenCalled();
			expect(response.status).toEqual(400);
			expect(response.body).toEqual({
				errors: {
					newAppealTypeId: ERROR_NOT_FOUND
				}
			});
		});
	});
});
