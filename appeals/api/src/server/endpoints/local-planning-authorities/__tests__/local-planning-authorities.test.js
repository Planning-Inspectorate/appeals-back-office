import { request } from '#tests/../app-test.js';
import { householdAppeal } from '#tests/appeals/mocks.js';
import { azureAdUserId } from '#tests/shared/mocks.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import { jest } from '@jest/globals';
import { AUDIT_TRAIL_LPA_UPDATED, ERROR_NOT_FOUND } from '@pins/appeals/constants/support.js';

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

	describe('POST /:appealId/lpa', () => {
		test('returns 200 if valid request', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			// @ts-ignore
			databaseConnector.lPA.findMany.mockResolvedValue([validLPA, newLPA]);
			// @ts-ignore
			databaseConnector.lPA.findUnique.mockResolvedValue(newLPA);
			// @ts-ignore
			databaseConnector.user.upsert.mockResolvedValue({
				id: 1,
				azureAdUserId
			});

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
			expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
				data: {
					appealId: householdAppeal.id,
					details: stringTokenReplacement(AUDIT_TRAIL_LPA_UPDATED, [newLPA.name]),
					loggedAt: expect.any(Date),
					userId: 1
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
