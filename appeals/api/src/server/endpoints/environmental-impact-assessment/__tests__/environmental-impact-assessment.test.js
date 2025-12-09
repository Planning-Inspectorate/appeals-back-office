// @ts-nocheck
import { request } from '#server/app-test.js';
import { householdAppeal } from '#tests/appeals/mocks.js';
import { azureAdUserId } from '#tests/shared/mocks.js';
import { jest } from '@jest/globals';

const { databaseConnector } = await import('#utils/database-connector.js');

describe('environmental impact assessment routes', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('invalid requests', () => {
		test('returns 404 when the appeal is not found', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(null);
			const response = await request
				.patch(`/appeals/0/eia-screening-required`)
				.send({ eiaScreeningRequired: true })
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(404);
		});

		test('returns 400 when eiaScreeningRequired is missing', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			const response = await request
				.patch(`/appeals/${householdAppeal.id}/eia-screening-required`)
				.send({})
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(400);
		});

		test('returns 400 when eiaScreeningRequired is not a boolean', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			const response = await request
				.patch(`/appeals/${householdAppeal.id}/eia-screening-required`)
				.send({ eiaScreeningRequired: 'not a boolean' })
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(400);
		});
	});

	describe('valid requests', () => {
		test('returns 200 and updates eiaScreeningRequired to true', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			databaseConnector.appeal.update.mockResolvedValue({
				id: householdAppeal.id,
				eiaScreeningRequired: true
			});
			databaseConnector.user.upsert.mockResolvedValue({
				id: 1,
				azureAdUserId
			});
			databaseConnector.auditTrail.create.mockResolvedValue({ id: 1 });

			const response = await request
				.patch(`/appeals/${householdAppeal.id}/eia-screening-required`)
				.send({ eiaScreeningRequired: true })
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(200);
			expect(response.body).toEqual(true);
			expect(databaseConnector.appeal.update).toHaveBeenCalledTimes(1);
			expect(databaseConnector.appeal.update).toHaveBeenCalledWith({
				data: {
					eiaScreeningRequired: true
				},
				where: {
					id: householdAppeal.id
				}
			});
			expect(databaseConnector.auditTrail.create).toHaveBeenCalledTimes(1);
			expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
				data: expect.objectContaining({
					appealId: householdAppeal.id,
					userId: 1
				})
			});
		});
		test('returns 200 and updates eiaScreeningRequired to true audit trail with system UUID', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			databaseConnector.appeal.update.mockResolvedValue({
				id: householdAppeal.id,
				eiaScreeningRequired: true
			});
			databaseConnector.user.upsert.mockResolvedValue({
				id: 1,
				azureAdUserId
			});
			databaseConnector.auditTrail.create.mockResolvedValue({ id: 1 });

			const response = await request
				.patch(`/appeals/${householdAppeal.id}/eia-screening-required`)
				.send({ eiaScreeningRequired: true })
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(200);
			expect(response.body).toEqual(true);
			expect(databaseConnector.appeal.update).toHaveBeenCalledTimes(1);
			expect(databaseConnector.appeal.update).toHaveBeenCalledWith({
				data: {
					eiaScreeningRequired: true
				},
				where: {
					id: householdAppeal.id
				}
			});
			expect(databaseConnector.auditTrail.create).toHaveBeenCalledTimes(1);
			expect(databaseConnector.auditTrail.create).toHaveBeenCalledWith({
				data: expect.objectContaining({
					appealId: householdAppeal.id,
					userId: 1
				})
			});
		});
	});
});
