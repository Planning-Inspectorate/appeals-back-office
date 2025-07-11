// @ts-nocheck
import { request } from '#tests/../app-test.js';
import { jest } from '@jest/globals';
import { azureAdUserId } from '#tests/shared/mocks.js';
import { householdAppeal } from '#tests/appeals/mocks.js';

const { databaseConnector } = await import('#utils/database-connector.js');

const validInquiryEstimate = {
	estimatedTime: 2
};

const invalidInquiryEstimate = {
	estimatedTime: -1
};

const appealWithInquiryEstimate = {
	...householdAppeal,
	inquiryEstimate: {
		id: 1,
		appealId: 1,
		estimatedTime: 2
	}
};

describe('appeal inquiry estimates routes', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('invalid requests', () => {
		test('returns 404 when the appeal is not found', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(null);
			const response = await request
				.post(`/appeals/0/inquiry-estimates`)
				.send(validInquiryEstimate)
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(404);
		});

		describe('invalid time values', () => {
			test('returns 400 when creating a inquiry estimate with negative time values', async () => {
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				const response = await request
					.post(`/appeals/${householdAppeal.id}/inquiry-estimates`)
					.send(invalidInquiryEstimate)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
			});

			test('returns 400 when creating a inquiry estimate with missing required fields', async () => {
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				const response = await request
					.post(`/appeals/${householdAppeal.id}/inquiry-estimates`)
					.send({})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
			});

			test('returns 400 when creating a inquiry estimate with non-numeric values', async () => {
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				const response = await request
					.post(`/appeals/${householdAppeal.id}/inquiry-estimates`)
					.send({
						estimatedTime: 'two'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
			});

			test('returns 400 when creating a inquiry estimate with values not in 0.5 increments', async () => {
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				const response = await request
					.post(`/appeals/${householdAppeal.id}/inquiry-estimates`)
					.send({
						estimatedTime: 2.3
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
			});

			test('returns 400 when creating a inquiry estimate with values too large', async () => {
				databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
				const response = await request
					.post(`/appeals/${householdAppeal.id}/inquiry-estimates`)
					.send({
						estimatedTime: 1000,
						sittingTime: 1000,
						reportingTime: 1000
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
			});
		});

		test('returns 404 when updating a inquiry estimate that does not exist', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			databaseConnector.inquiryEstimate.findUnique.mockResolvedValue(null);

			const response = await request
				.patch(`/appeals/${householdAppeal.id}/inquiry-estimates`)
				.send(validInquiryEstimate)
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(404);
		});

		describe('invalid time values for update', () => {
			test('returns 400 when updating a inquiry estimate with negative time values', async () => {
				databaseConnector.appeal.findUnique.mockResolvedValue(appealWithInquiryEstimate);
				databaseConnector.inquiryEstimate.findUnique.mockResolvedValue(
					appealWithInquiryEstimate.inquiryEstimate
				);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/inquiry-estimates`)
					.send(invalidInquiryEstimate)
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
			});

			test('returns 400 when updating a inquiry estimate with missing required fields', async () => {
				databaseConnector.appeal.findUnique.mockResolvedValue(appealWithInquiryEstimate);
				databaseConnector.inquiryEstimate.findUnique.mockResolvedValue(
					appealWithInquiryEstimate.inquiryEstimate
				);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/inquiry-estimates`)
					.send({})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
			});

			test('returns 400 when updating a inquiry estimate with non-numeric values', async () => {
				databaseConnector.appeal.findUnique.mockResolvedValue(appealWithInquiryEstimate);
				databaseConnector.inquiryEstimate.findUnique.mockResolvedValue(
					appealWithInquiryEstimate.inquiryEstimate
				);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/inquiry-estimates`)
					.send({
						estimatedTime: 'two'
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
			});

			test('returns 400 when updating a inquiry estimate with values not in 0.5 increments', async () => {
				databaseConnector.appeal.findUnique.mockResolvedValue(appealWithInquiryEstimate);
				databaseConnector.inquiryEstimate.findUnique.mockResolvedValue(
					appealWithInquiryEstimate.inquiryEstimate
				);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/inquiry-estimates`)
					.send({
						estimatedTime: 2.3
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
			});

			test('returns 400 when updating a inquiry estimate with values too large', async () => {
				databaseConnector.appeal.findUnique.mockResolvedValue(appealWithInquiryEstimate);
				databaseConnector.inquiryEstimate.findUnique.mockResolvedValue(
					appealWithInquiryEstimate.inquiryEstimate
				);

				const response = await request
					.patch(`/appeals/${householdAppeal.id}/inquiry-estimates`)
					.send({
						estimatedTime: 1000
					})
					.set('azureAdUserId', azureAdUserId);

				expect(response.status).toEqual(400);
			});
		});

		test('returns 404 when deleting a inquiry estimate that does not exist', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			databaseConnector.inquiryEstimate.findUnique.mockResolvedValue(null);

			const response = await request
				.delete(`/appeals/${householdAppeal.id}/inquiry-estimates`)
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(404);
		});
	});

	describe('valid requests', () => {
		test('returns 201 when creating a inquiry estimate with valid values', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(householdAppeal);
			databaseConnector.inquiryEstimate.create.mockResolvedValue({ id: 1 });

			const response = await request
				.post(`/appeals/${householdAppeal.id}/inquiry-estimates`)
				.send(validInquiryEstimate)
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(201);
			expect(databaseConnector.inquiryEstimate.create).toHaveBeenCalledTimes(1);
			expect(databaseConnector.inquiryEstimate.create).toHaveBeenCalledWith({
				data: {
					appealId: householdAppeal.id,
					estimatedTime: validInquiryEstimate.estimatedTime
				}
			});
		});

		test('returns 200 when updating a inquiry estimate with valid values', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(appealWithInquiryEstimate);
			databaseConnector.inquiryEstimate.findUnique.mockResolvedValue(
				appealWithInquiryEstimate.inquiryEstimate
			);
			databaseConnector.inquiryEstimate.update.mockResolvedValue({ id: 1 });

			const response = await request
				.patch(`/appeals/${householdAppeal.id}/inquiry-estimates`)
				.send(validInquiryEstimate)
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(200);
			expect(databaseConnector.inquiryEstimate.update).toHaveBeenCalledTimes(1);
			expect(databaseConnector.inquiryEstimate.update).toHaveBeenCalledWith({
				where: { appealId: householdAppeal.id },
				data: {
					estimatedTime: validInquiryEstimate.estimatedTime
				}
			});
		});

		test('returns 200 when deleting a inquiry estimate', async () => {
			databaseConnector.appeal.findUnique.mockResolvedValue(appealWithInquiryEstimate);
			databaseConnector.inquiryEstimate.findUnique.mockResolvedValue(
				appealWithInquiryEstimate.inquiryEstimate
			);
			databaseConnector.inquiryEstimate.delete.mockResolvedValue({ id: 1 });

			const response = await request
				.delete(`/appeals/${householdAppeal.id}/inquiry-estimates`)
				.set('azureAdUserId', azureAdUserId);

			expect(response.status).toEqual(200);
			expect(databaseConnector.inquiryEstimate.delete).toHaveBeenCalledTimes(1);
			expect(databaseConnector.inquiryEstimate.delete).toHaveBeenCalledWith({
				where: { appealId: householdAppeal.id }
			});
		});
	});
});
