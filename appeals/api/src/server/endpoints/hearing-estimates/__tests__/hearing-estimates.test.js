// @ts-nocheck
import { request } from '#server/app-test.js';
import { householdAppeal } from '#tests/appeals/mocks.js';
import { azureAdUserId } from '#tests/shared/mocks.js';
import { jest } from '@jest/globals';

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
			databaseConnector.hearingEstimate.create.mockResolvedValue({ id: 1 });

			const response = await request
				.post(`/appeals/${householdAppeal.id}/hearing-estimates`)
				.send(validHearingEstimate)
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(201);
			expect(databaseConnector.hearingEstimate.create).toHaveBeenCalledTimes(1);
			expect(databaseConnector.hearingEstimate.create).toHaveBeenCalledWith({
				data: {
					appealId: householdAppeal.id,
					preparationTime: validHearingEstimate.preparationTime,
					sittingTime: validHearingEstimate.sittingTime,
					reportingTime: validHearingEstimate.reportingTime
				}
			});
		});

		test('returns 200 when updating a hearing estimate with valid values', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(appealWithHearingEstimate);
			databaseConnector.hearingEstimate.findUnique.mockResolvedValue(
				appealWithHearingEstimate.hearingEstimate
			);
			databaseConnector.hearingEstimate.update.mockResolvedValue({ id: 1 });

			const response = await request
				.patch(`/appeals/${householdAppeal.id}/hearing-estimates`)
				.send(validHearingEstimate)
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(200);
			expect(databaseConnector.hearingEstimate.update).toHaveBeenCalledTimes(1);
			expect(databaseConnector.hearingEstimate.update).toHaveBeenCalledWith({
				where: { appealId: householdAppeal.id },
				data: {
					preparationTime: validHearingEstimate.preparationTime,
					sittingTime: validHearingEstimate.sittingTime,
					reportingTime: validHearingEstimate.reportingTime
				}
			});
		});

		test('returns 200 when deleting a hearing estimate', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(appealWithHearingEstimate);
			databaseConnector.hearingEstimate.findUnique.mockResolvedValue(
				appealWithHearingEstimate.hearingEstimate
			);
			databaseConnector.hearingEstimate.delete.mockResolvedValue({ id: 1 });

			const response = await request
				.delete(`/appeals/${householdAppeal.id}/hearing-estimates`)
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(200);
			expect(databaseConnector.hearingEstimate.delete).toHaveBeenCalledTimes(1);
			expect(databaseConnector.hearingEstimate.delete).toHaveBeenCalledWith({
				where: { appealId: householdAppeal.id }
			});
		});
	});
});
