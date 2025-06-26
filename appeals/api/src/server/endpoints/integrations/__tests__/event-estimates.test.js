// @ts-nocheck
import { broadcastEventEstimates } from '../integrations.broadcasters/event-estimates.js'; // adjust path if needed
import { databaseConnector } from '#utils/database-connector.js';
import { eventClient } from '#infrastructure/event-client.js';
import { EVENT_TYPE } from '@pins/appeals/constants/common.js';
import { EventType } from '@pins/event-client';
import { jest } from '@jest/globals';
import config from '#config/config.js';

// Mocks
jest.mock('#utils/database-connector.js', () => ({
	databaseConnector: {
		hearingEstimate: { findUnique: jest.fn() },
		appeal: { findUnique: jest.fn() }
	}
}));

jest.mock('#infrastructure/event-client.js', () => ({
	eventClient: { sendEvents: jest.fn() }
}));

jest.mock('#mappers/integration/map-event-estimates-entity.js', () => ({
	mapHearingEstimateEntity: jest.fn()
}));

jest.mock('#utils/logger.js', () => ({
	error: jest.fn(),
	info: jest.fn()
}));

jest.mock('#config/config.js', () => ({
	__esModule: true,
	default: {
		serviceBusEnabled: true, // default value for all tests
		NODE_ENV: 'production'
	}
}));

const mockHearingEstimate = {
	id: 1,
	appealId: 2,
	appeal: {
		reference: '6000002'
	},
	preparationTime: 10,
	sittingTime: 1,
	reportingTime: 20
};

describe('broadcastEvent', () => {
	beforeEach(() => {
		config.serviceBusEnabled = true;
		jest.clearAllMocks();
	});

	afterAll(() => {
		jest.clearAllMocks();
	});

	describe('Hearing Estimates', () => {
		it('should broadcast a valid create hearing estimate event', async () => {
			databaseConnector.hearingEstimate.findUnique.mockResolvedValue(mockHearingEstimate);
			eventClient.sendEvents.mockResolvedValue(true);

			const result = await broadcastEventEstimates(2, EVENT_TYPE.HEARING, EventType.Create);

			expect(databaseConnector.hearingEstimate.findUnique).toHaveBeenCalled();
			expect(eventClient.sendEvents).toHaveBeenCalledWith(
				expect.anything(),
				[
					{
						id: 1,
						caseReference: '6000002',
						preparationTime: 10,
						reportingTime: 20,
						sittingTime: 1
					}
				],
				EventType.Create,
				expect.anything()
			);
			expect(result).toBe(true);
		});

		it('should broadcast a valid update hearing estimate event', async () => {
			databaseConnector.hearingEstimate.findUnique.mockResolvedValue({
				...mockHearingEstimate,
				preparationTime: 20
			});
			eventClient.sendEvents.mockResolvedValue(true);

			const result = await broadcastEventEstimates(2, EVENT_TYPE.HEARING, EventType.Update);

			expect(databaseConnector.hearingEstimate.findUnique).toHaveBeenCalled();
			expect(eventClient.sendEvents).toHaveBeenCalledWith(
				expect.anything(),
				[
					{
						id: 1,
						caseReference: '6000002',
						preparationTime: 20,
						reportingTime: 20,
						sittingTime: 1
					}
				],
				EventType.Update,
				expect.anything()
			);
			expect(result).toBe(true);
		});

		it('should handle delete hearing estimate with existing hearing estimate and appeal', async () => {
			databaseConnector.hearingEstimate.findUnique.mockResolvedValue(null);
			databaseConnector.appeal.findUnique.mockResolvedValue({ id: 1, reference: '6000002' });

			eventClient.sendEvents.mockResolvedValue(true);

			const existingHearing = { appealId: 1, hearingStartTime: new Date('2025-01-01T13:00') };
			const result = await broadcastEventEstimates(
				2,
				EVENT_TYPE.HEARING,
				EventType.Delete,
				existingHearing
			);
			expect(databaseConnector.appeal.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });

			expect(eventClient.sendEvents).toHaveBeenCalledWith(
				expect.anything(),
				[
					{
						id: 2,
						caseReference: '6000002',
						preparationTime: 0,
						reportingTime: 0,
						sittingTime: 0
					}
				],
				EventType.Delete,
				expect.anything()
			);

			expect(result).toBe(true);
		});

		it('should return false if hearing estimate not found and not deleting', async () => {
			databaseConnector.hearingEstimate.findUnique.mockResolvedValue(null);

			const result = await broadcastEventEstimates(2, EVENT_TYPE.HEARING, EventType.Update);

			expect(result).toBe(false);
		});

		it('should return false if appeal not found when deleting a hearing estimate', async () => {
			databaseConnector.hearingEstimate.findUnique.mockResolvedValue(null);
			databaseConnector.appeal.findUnique.mockResolvedValue(null);

			const existingHearing = { appealId: 1, hearingStartTime: '2025-01-01' };
			const result = await broadcastEventEstimates(
				2,
				EVENT_TYPE.HEARING,
				EventType.Delete,
				existingHearing
			);

			expect(result).toBe(false);
		});
	});
});
