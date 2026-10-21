// @ts-nocheck
import { request } from '#server/app-test.js';
import {
	childAppealsEnforcementBase,
	enforcementNoticeAppeal,
	householdAppeal
} from '#tests/appeals/mocks.js';
import { azureAdUserId } from '#tests/shared/mocks.js';
import { jest } from '@jest/globals';
import { CASE_RELATIONSHIP_LINKED } from '@pins/appeals/constants/support.js';
const { databaseConnector } = await import('#utils/database-connector.js');

const validHearingEstimate = {
	preparationTime: 2,
	sittingTime: 3,
	reportingTime: 1.5
};

const invalidHearingEstimate = {
	preparationTime: -1,
	sittingTime: 0,
	reportingTime: -2
};

const appealWithHearingEstimate = {
	...householdAppeal,
	hearingEstimate: {
		id: 1,
		appealId: 1,
		preparationTime: 2,
		sittingTime: 3,
		reportingTime: 1
	}
};
const enforcementAppealwithHearingEstimate = {
	...enforcementNoticeAppeal,
	hearingEstimate: {
		id: 1,
		appealId: 1,
		preparationTime: 2,
		sittingTime: 3,
		reportingTime: 1
	}
};
describe('appeal hearing estimates routes', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('invalid requests', () => {
		test('returns 404 when the appeal is not found', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(null);
			const response = await request
				.post(`/appeals/0/hearing-estimates`)
				.send(validHearingEstimate)
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(404);
		});

		describe('invalid time values', () => {
			test('returns 400 when creating a hearing estimate with negative time values', async () => {
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				const response = await request
					.post(`/appeals/${householdAppeal.id}/hearing-estimates`)
					.send(invalidHearingEstimate)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
			});

			test('returns 400 when creating a hearing estimate with missing required fields', async () => {
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				const response = await request
					.post(`/appeals/${householdAppeal.id}/hearing-estimates`)
					.send({
						preparationTime: 2,
						sittingTime: 3
						// reportingTime is missing
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
			});

			test('returns 400 when creating a hearing estimate with non-numeric values', async () => {
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				const response = await request
					.post(`/appeals/${householdAppeal.id}/hearing-estimates`)
					.send({
						preparationTime: 'two',
						sittingTime: 3,
						reportingTime: 1.5
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
			});

			test('returns 400 when creating a hearing estimate with values not in 0.5 increments', async () => {
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				const response = await request
					.post(`/appeals/${householdAppeal.id}/hearing-estimates`)
					.send({
						preparationTime: 2.3,
						sittingTime: 3.7,
						reportingTime: 1.1
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
			});

			test('returns 400 when creating a hearing estimate with values too large', async () => {
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				const response = await request
					.post(`/appeals/${householdAppeal.id}/hearing-estimates`)
					.send({
						preparationTime: 1000,
						sittingTime: 1000,
						reportingTime: 1000
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
			});
		});

		test('returns 404 when updating a hearing estimate that does not exist', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			databaseConnector.hearingEstimate.findUnique.mockResolvedValue(null);

			const response = await request
				.patch(`/appeals/${householdAppeal.id}/hearing-estimates`)
				.send(validHearingEstimate)
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(404);
		});

		describe('invalid time values for update', () => {
			test('returns 400 when updating a hearing estimate with negative time values', async () => {
				databaseConnector.appeal.findUnique.mockResolvedValue(appealWithHearingEstimate);
				databaseConnector.hearingEstimate.findUnique.mockResolvedValue(
					appealWithHearingEstimate.hearingEstimate
				);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/hearing-estimates`)
					.send(invalidHearingEstimate)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
			});

			test('returns 400 when updating a hearing estimate with missing required fields', async () => {
				databaseConnector.appeal.findUnique.mockResolvedValue(appealWithHearingEstimate);
				databaseConnector.hearingEstimate.findUnique.mockResolvedValue(
					appealWithHearingEstimate.hearingEstimate
				);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/hearing-estimates`)
					.send({
						preparationTime: 2,
						sittingTime: 3
						// reportingTime is missing
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
			});

			test('returns 400 when updating a hearing estimate with non-numeric values', async () => {
				databaseConnector.appeal.findUnique.mockResolvedValue(appealWithHearingEstimate);
				databaseConnector.hearingEstimate.findUnique.mockResolvedValue(
					appealWithHearingEstimate.hearingEstimate
				);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/hearing-estimates`)
					.send({
						preparationTime: 'two',
						sittingTime: 3,
						reportingTime: 1.5
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
			});

			test('returns 400 when updating a hearing estimate with values not in 0.5 increments', async () => {
				databaseConnector.appeal.findUnique.mockResolvedValue(appealWithHearingEstimate);
				databaseConnector.hearingEstimate.findUnique.mockResolvedValue(
					appealWithHearingEstimate.hearingEstimate
				);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/hearing-estimates`)
					.send({
						preparationTime: 2.3,
						sittingTime: 3.7,
						reportingTime: 1.1
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
			});

			test('returns 400 when updating a hearing estimate with values too large', async () => {
				databaseConnector.appeal.findUnique.mockResolvedValue(appealWithHearingEstimate);
				databaseConnector.hearingEstimate.findUnique.mockResolvedValue(
					appealWithHearingEstimate.hearingEstimate
				);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/hearing-estimates`)
					.send({
						preparationTime: 1000,
						sittingTime: 1000,
						reportingTime: 1000
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
			});
		});

		test('returns 404 when deleting a hearing estimate that does not exist', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			databaseConnector.hearingEstimate.findUnique.mockResolvedValue(null);

			const response = await request
				.delete(`/appeals/${householdAppeal.id}/hearing-estimates`)
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(404);
		});
	});

	describe('valid requests', () => {
		test('returns 201 when creating a hearing estimate with valid values', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			databaseConnector.hearingEstimate.createMany.mockResolvedValue({ count: 1 });
			databaseConnector.hearingEstimate.findMany.mockResolvedValue([
				{
					id: 1,
					appealId: householdAppeal.id,
					preparationTime: validHearingEstimate.preparationTime,
					sittingTime: validHearingEstimate.sittingTime,
					reportingTime: validHearingEstimate.reportingTime
				}
			]);
			const response = await request
				.post(`/appeals/${householdAppeal.id}/hearing-estimates`)
				.send(validHearingEstimate)
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(201);
			expect(databaseConnector.hearingEstimate.createMany).toHaveBeenCalledTimes(1);
			expect(databaseConnector.hearingEstimate.createMany).toHaveBeenCalledWith({
				data: [
					{
						appealId: householdAppeal.id,
						preparationTime: validHearingEstimate.preparationTime,
						sittingTime: validHearingEstimate.sittingTime,
						reportingTime: validHearingEstimate.reportingTime
					}
				]
			});
		});

		test('returns 200 when updating a hearing estimate with valid values', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(appealWithHearingEstimate);
			databaseConnector.hearingEstimate.findUnique.mockResolvedValue(
				appealWithHearingEstimate.hearingEstimate
			);
			databaseConnector.hearingEstimate.findMany.mockResolvedValue([
				appealWithHearingEstimate.hearingEstimate
			]);

			const response = await request
				.patch(`/appeals/${householdAppeal.id}/hearing-estimates`)
				.send(validHearingEstimate)
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(200);
			expect(databaseConnector.hearingEstimate.updateMany).toHaveBeenCalledTimes(1);
			expect(databaseConnector.hearingEstimate.updateMany).toHaveBeenCalledWith({
				where: { appealId: { in: [householdAppeal.id] } },
				data: {
					preparationTime: validHearingEstimate.preparationTime,
					sittingTime: validHearingEstimate.sittingTime,
					reportingTime: validHearingEstimate.reportingTime
				}
			});
		});

		test('returns 200 when deleting a hearing estimate', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(appealWithHearingEstimate);
			databaseConnector.hearingEstimate.findMany.mockResolvedValue([
				appealWithHearingEstimate.hearingEstimate
			]);
			databaseConnector.hearingEstimate.findUnique.mockResolvedValue(
				appealWithHearingEstimate.hearingEstimate
			);
			databaseConnector.hearingEstimate.deleteMany.mockResolvedValue({ count: 1 });

			const response = await request
				.delete(`/appeals/${householdAppeal.id}/hearing-estimates`)
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(200);
			expect(databaseConnector.hearingEstimate.deleteMany).toHaveBeenCalledTimes(1);
			expect(databaseConnector.hearingEstimate.deleteMany).toHaveBeenCalledWith({
				where: { appealId: { in: [householdAppeal.id] } }
			});
		});
	});
	describe('valid requests with enforcement linked appeals', () => {
		const filteredLinkedChildAppeals = childAppealsEnforcementBase.filter(
			(childAppeal) => childAppeal.type === CASE_RELATIONSHIP_LINKED
		);
		const expectedDataWithLinkedChildAppealsIds = [
			enforcementNoticeAppeal.id,
			...filteredLinkedChildAppeals.map((childAppeal) => childAppeal.childId)
		];
		test('returns 201 when creating a hearing estimate with valid values and with linked child appeals', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue({
				...enforcementNoticeAppeal,
				childAppeals: childAppealsEnforcementBase
			});

			databaseConnector.hearingEstimate.createMany.mockResolvedValue({ count: 4 });

			const response = await request
				.post(`/appeals/${enforcementNoticeAppeal.id}/hearing-estimates`)
				.send(validHearingEstimate)
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(201);
			expect(databaseConnector.hearingEstimate.createMany).toHaveBeenCalledTimes(1);
			const expectedChildDate = filteredLinkedChildAppeals.map((childAppeal) => ({
				appealId: childAppeal.childId,
				preparationTime: validHearingEstimate.preparationTime,
				sittingTime: validHearingEstimate.sittingTime,
				reportingTime: validHearingEstimate.reportingTime
			}));
			const expectedData = [
				{
					appealId: enforcementNoticeAppeal.id,
					preparationTime: validHearingEstimate.preparationTime,
					sittingTime: validHearingEstimate.sittingTime,
					reportingTime: validHearingEstimate.reportingTime
				},
				...expectedChildDate
			];
			expect(databaseConnector.hearingEstimate.createMany).toHaveBeenCalledWith({
				data: expectedData
			});
		});

		test('returns 200 when updating a hearing estimate with valid values and with linked child appeals', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue({
				...enforcementAppealwithHearingEstimate,
				childAppeals: childAppealsEnforcementBase
			});
			databaseConnector.hearingEstimate.findMany.mockResolvedValue([
				enforcementAppealwithHearingEstimate.hearingEstimate,
				...filteredLinkedChildAppeals.map((childAppeal) => ({
					id: childAppeal.childId,
					appealId: childAppeal.childId,
					preparationTime: validHearingEstimate.preparationTime,
					sittingTime: validHearingEstimate.sittingTime,
					reportingTime: validHearingEstimate.reportingTime
				}))
			]);
			databaseConnector.hearingEstimate.updateMany.mockResolvedValue({ id: 1 });

			const response = await request
				.patch(`/appeals/${enforcementAppealwithHearingEstimate.id}/hearing-estimates`)
				.send(validHearingEstimate)
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(200);
			expect(databaseConnector.hearingEstimate.findMany).toHaveBeenCalledTimes(1);
			expect(databaseConnector.hearingEstimate.findMany).toHaveBeenCalledWith({
				where: {
					appealId: {
						in: expectedDataWithLinkedChildAppealsIds
					}
				}
			});
			expect(databaseConnector.hearingEstimate.updateMany).toHaveBeenCalledTimes(1);
			expect(databaseConnector.hearingEstimate.updateMany).toHaveBeenCalledWith({
				where: {
					appealId: {
						in: expectedDataWithLinkedChildAppealsIds
					}
				},
				data: {
					preparationTime: validHearingEstimate.preparationTime,
					sittingTime: validHearingEstimate.sittingTime,
					reportingTime: validHearingEstimate.reportingTime
				}
			});
		});

		test('returns 200 when deleting a hearing estimate and with linked child appeals', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue({
				...enforcementAppealwithHearingEstimate,
				childAppeals: childAppealsEnforcementBase
			});

			databaseConnector.hearingEstimate.findMany.mockResolvedValue([
				enforcementAppealwithHearingEstimate.hearingEstimate,
				...filteredLinkedChildAppeals.map((childAppeal) => ({
					id: childAppeal.childId,
					appealId: childAppeal.childId,
					preparationTime: validHearingEstimate.preparationTime,
					sittingTime: validHearingEstimate.sittingTime,
					reportingTime: validHearingEstimate.reportingTime
				}))
			]);
			databaseConnector.hearingEstimate.deleteMany.mockResolvedValue({ count: 4 });

			const response = await request
				.delete(`/appeals/${enforcementAppealwithHearingEstimate.id}/hearing-estimates`)
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(200);
			expect(databaseConnector.hearingEstimate.deleteMany).toHaveBeenCalledTimes(1);
			expect(databaseConnector.hearingEstimate.deleteMany).toHaveBeenCalledWith({
				where: {
					appealId: {
						in: expectedDataWithLinkedChildAppealsIds
					}
				}
			});
		});
	});
});
