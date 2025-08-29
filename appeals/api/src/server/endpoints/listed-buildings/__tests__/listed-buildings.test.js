// @ts-nocheck
import { request } from '#tests/../app-test.js';
import { householdAppeal } from '#tests/appeals/mocks.js';
import { azureAdUserId } from '#tests/shared/mocks.js';
import { jest } from '@jest/globals';

const { databaseConnector } = await import('#utils/database-connector.js');

const validListedBuilding = {
	lpaQuestionnaireId: '1',
	listEntry: '12345',
	affectsListedBuilding: true
};

describe('appeal affected listed buildings routes', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});
	describe('valid requests', () => {
		test('returns 200 when creating a listed building with a valid request', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			// @ts-ignore
			databaseConnector.listedBuildingSelected.create.mockResolvedValue({});

			const response = await request
				.post(`/appeals/${householdAppeal.id}/listed-buildings`)
				.send(validListedBuilding)
				.set('azureAdUserId', azureAdUserId);
			expect(response.status).toEqual(201);
			expect(databaseConnector.listedBuildingSelected.create).toHaveBeenCalledTimes(1);
			expect(databaseConnector.listedBuildingSelected.create).toHaveBeenCalledWith({
				data: {
					lpaQuestionnaireId: Number(validListedBuilding.lpaQuestionnaireId),
					listEntry: validListedBuilding.listEntry,
					affectsListedBuilding: validListedBuilding.affectsListedBuilding
				}
			});
		});

		test('returns 200 when updating a listed building with a valid request', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			// @ts-ignore
			databaseConnector.$transaction = jest.fn().mockImplementation((callback) =>
				// @ts-ignore
				callback({
					listedBuildingSelected: {
						// @ts-ignore
						findUnique: jest
							.fn()
							.mockResolvedValue(householdAppeal.lpaQuestionnaire.listedBuildingDetails[0]),
						// @ts-ignore
						update: jest.fn().mockResolvedValueOnce(true)
					}
				})
			);

			const response = await request
				.patch(
					`/appeals/${householdAppeal.id}/listed-buildings/${householdAppeal.lpaQuestionnaire.listedBuildingDetails[0].id}`
				)
				.send({
					listEntry: '12345',
					affectsListedBuilding: true
				})
				.set('azureAdUserId', azureAdUserId);
			expect(response.status).toEqual(200);
			expect(databaseConnector.$transaction).toHaveBeenCalledTimes(1);
		});

		test('returns 200 when deleting a listed building with a valid request', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

			// @ts-ignore
			databaseConnector.$transaction = jest.fn().mockImplementation((callback) =>
				// @ts-ignore
				callback({
					listedBuildingSelected: {
						// @ts-ignore
						findUnique: jest
							.fn()
							.mockResolvedValue(householdAppeal.lpaQuestionnaire.listedBuildingDetails[0]),
						// @ts-ignore
						delete: jest.fn().mockResolvedValueOnce(true)
					}
				})
			);

			const response = await request
				.delete(`/appeals/${householdAppeal.id}/listed-buildings`)
				.send({
					listedBuildingId: '1'
				})
				.set('azureAdUserId', azureAdUserId);
			expect(response.status).toEqual(200);
			expect(databaseConnector.$transaction).toHaveBeenCalledTimes(1);
		});
	});

	describe('invalid requests', () => {
		test('returns 404 when the appeal is not found', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(null);
			const response = await request
				.post(`/appeals/0/listed-buildings`)
				.send(validListedBuilding)
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(404);
		});

		test('returns 400 when creating a listed building missing the lpaQuestionnaireId field', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			// @ts-ignore
			databaseConnector.listedBuildingSelected.create.mockResolvedValue({});

			const response = await request
				.post(`/appeals/${householdAppeal.id}/listed-buildings`)
				.send({
					listEntry: '12345',
					affectsListedBuilding: true
				})
				.set('azureAdUserId', azureAdUserId);
			expect(response.status).toEqual(400);
		});

		test('returns 400 when creating a listed building missing the listEntry field', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			// @ts-ignore
			databaseConnector.listedBuildingSelected.create.mockResolvedValue({});

			const response = await request
				.post(`/appeals/${householdAppeal.id}/listed-buildings`)
				.send({
					lpaQuestionnaireId: '1',
					affectsListedBuilding: true
				})
				.set('azureAdUserId', azureAdUserId);
			expect(response.status).toEqual(400);
		});

		test('returns 400 when creating a listed building missing the affectsListedBuilding field', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			// @ts-ignore
			databaseConnector.listedBuildingSelected.create.mockResolvedValue({});

			const response = await request
				.post(`/appeals/${householdAppeal.id}/listed-buildings`)
				.send({
					lpaQuestionnaireId: '1',
					listEntry: '12345'
				})
				.set('azureAdUserId', azureAdUserId);
			expect(response.status).toEqual(400);
		});

		test('returns 404 when updating a listed building with an invalid listedBuildingId', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			// @ts-ignore
			databaseConnector.$transaction = jest.fn().mockImplementation((callback) =>
				// @ts-ignore
				callback({
					listedBuildingSelected: {
						// @ts-ignore
						findUnique: jest.fn().mockResolvedValue(null),
						// @ts-ignore
						update: jest.fn().mockResolvedValueOnce(false)
					}
				})
			);
			const response = await request
				.patch(`/appeals/${householdAppeal.id}/listed-buildings/99`)
				.send({
					listEntry: '12345',
					affectsListedBuilding: true
				})
				.set('azureAdUserId', azureAdUserId);
			expect(response.status).toEqual(404);
		});

		test('returns 400 when updating a listed building missing the listEntry field', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

			const response = await request
				.patch(
					`/appeals/${householdAppeal.id}/listed-buildings/${householdAppeal.lpaQuestionnaire.listedBuildingDetails[0].id}`
				)
				.send({
					affectsListedBuilding: true
				})
				.set('azureAdUserId', azureAdUserId);
			expect(response.status).toEqual(400);
		});

		test('returns 400 when updating a listed building missing the affectsListedBuilding field', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

			const response = await request
				.patch(
					`/appeals/${householdAppeal.id}/listed-buildings/${householdAppeal.lpaQuestionnaire.listedBuildingDetails[0].id}`
				)
				.send({
					listEntry: '12345'
				})
				.set('azureAdUserId', azureAdUserId);
			expect(response.status).toEqual(400);
		});

		test('returns 404 when deleting a listed building with an invalid listedBuildingId', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			// @ts-ignore
			databaseConnector.$transaction = jest.fn().mockImplementation((callback) =>
				// @ts-ignore
				callback({
					listedBuildingSelected: {
						// @ts-ignore
						findUnique: jest.fn().mockResolvedValue(null),
						// @ts-ignore
						delete: jest.fn().mockResolvedValueOnce(false)
					}
				})
			);
			const response = await request
				.delete(`/appeals/${householdAppeal.id}/listed-buildings`)
				.send({
					listedBuildingId: '999'
				})
				.set('azureAdUserId', azureAdUserId);
			expect(response.status).toEqual(404);
		});

		test('returns 400 when updating a listed building missing the listedBuildingId field', async () => {
			// @ts-ignore
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);

			const response = await request
				.delete(`/appeals/${householdAppeal.id}/listed-buildings`)
				.send({})
				.set('azureAdUserId', azureAdUserId);
			expect(response.status).toEqual(400);
		});
	});
});
