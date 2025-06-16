// @ts-nocheck
import { broadcastEvent } from '../integrations.broadcasters/event.js'; // adjust path if needed
import { databaseConnector } from '#utils/database-connector.js';
import { eventClient } from '#infrastructure/event-client.js';
import { EVENT_TYPE } from '@pins/appeals/constants/common.js';
import { EventType } from '@pins/event-client';
import { jest } from '@jest/globals';

// Mocks
jest.mock('#utils/database-connector.js', () => ({
	databaseConnector: {
		siteVisit: { findUnique: jest.fn() },
		hearing: { findUnique: jest.fn() },
		appeal: { findUnique: jest.fn() }
	}
}));

jest.mock('#infrastructure/event-client.js', () => ({
	eventClient: { sendEvents: jest.fn() }
}));

jest.mock('#mappers/integration/map-event-entity.js', () => ({
	mapSiteVisitEntity: jest.fn(),
	mapHearingEntity: jest.fn()
}));

jest.mock('#utils/logger.js', () => ({
	error: jest.fn(),
	info: jest.fn()
}));

jest.mock('#config/config.js', () => ({
	serviceBusEnabled: true,
	NODE_ENV: 'test'
}));

const mockHearing = {
	id: 1,
	address: {
		addressLine1: '1',
		addressLine2: 'Bishopsgate',
		addressCounty: 'London',
		postcode: 'LA23 5GH',
		addressTown: 'London City'
	},
	appealId: 2,
	addressId: 1,
	appeal: {
		reference: '6000002'
	},
	hearingStartTime: new Date('2025-07-01T10:00:00'),
	hearingEndTime: new Date('2025-07-01T11:00:00')
};

const mockSiteVisit = {
	id: 1,
	appeal: {
		reference: '6000006',
		address: {
			addressLine1: '1',
			addressLine2: 'Bishopsgate',
			addressCounty: 'London',
			postcode: 'LA23 5GH',
			addressTown: 'London City'
		}
	},
	siteVisitType: {
		key: 'site_visit_unaccompanied'
	},
	visitStartTime: new Date('2025-07-01T10:00:00'),
	visitEndTime: new Date('2025-07-01T11:00:00')
};

describe('broadcastEvent', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('Site Visits', () => {
		it('should broadcast a valid site visit event', async () => {
			databaseConnector.siteVisit.findUnique.mockResolvedValue(mockSiteVisit);
			eventClient.sendEvents.mockResolvedValue(true);

			const result = await broadcastEvent(1, EVENT_TYPE.SITE_VISIT, EventType.Create);

			expect(databaseConnector.siteVisit.findUnique).toHaveBeenCalled();
			expect(eventClient.sendEvents).toHaveBeenCalledWith(
				expect.anything(),
				[
					{
						addressCounty: 'London',
						addressLine1: '1',
						addressLine2: 'Bishopsgate',
						addressPostcode: 'LA23 5GH',
						addressTown: 'London City',
						caseReference: '6000006',
						eventEndDateTime: '2025-07-01T11:00:00.000Z',
						eventId: '6000006-1',
						eventName: 'Site visit #1',
						eventPublished: true,
						eventStartDateTime: '2025-07-01T10:00:00.000Z',
						eventStatus: 'offered',
						eventType: 'site_visit_unaccompanied',
						isUrgent: false,
						notificationOfSiteVisit: null
					}
				],
				EventType.Create,
				expect.anything()
			);
			expect(result).toBe(true);
		});

		it('should return false and log error if site visit not found', async () => {
			databaseConnector.siteVisit.findUnique.mockResolvedValue(null);

			const result = await broadcastEvent(1, EVENT_TYPE.SITE_VISIT, EventType.Create);
			expect(result).toBe(false);
		});

		it('should return false if validation fails', async () => {
			databaseConnector.siteVisit.findUnique.mockResolvedValue({
				...mockSiteVisit,
				appeal: { reference: 6000002 }
			});

			const result = await broadcastEvent(1, EVENT_TYPE.SITE_VISIT, EventType.Create);

			expect(result).toBe(false);
		});

		it('should return false if sendEvents fails', async () => {
			databaseConnector.siteVisit.findUnique.mockResolvedValue(mockSiteVisit);
			eventClient.sendEvents.mockResolvedValue(false);

			const result = await broadcastEvent(1, EVENT_TYPE.SITE_VISIT, EventType.Create);

			expect(result).toBe(false);
		});
	});

	describe('Hearing', () => {
		it('should broadcast a valid hearing event', async () => {
			databaseConnector.hearing.findUnique.mockResolvedValue(mockHearing);
			eventClient.sendEvents.mockResolvedValue(true);

			const result = await broadcastEvent(2, EVENT_TYPE.HEARING, EventType.Update);

			expect(databaseConnector.hearing.findUnique).toHaveBeenCalled();
			expect(eventClient.sendEvents).toHaveBeenCalled();
			expect(result).toBe(true);
		});

		it('should handle delete hearing with existing hearing and appeal', async () => {
			databaseConnector.hearing.findUnique.mockResolvedValue(null);
			databaseConnector.appeal.findUnique.mockResolvedValue({ id: 1, reference: 'APP/123' });

			eventClient.sendEvents.mockResolvedValue(true);

			const existingHearing = { appealId: 1, hearingStartTime: new Date('2025-01-01T13:00') };
			const result = await broadcastEvent(2, EVENT_TYPE.HEARING, EventType.Delete, existingHearing);
			expect(databaseConnector.appeal.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
			expect(result).toBe(true);
		});

		it('should return false if hearing not found and not deleting', async () => {
			databaseConnector.hearing.findUnique.mockResolvedValue(null);

			const result = await broadcastEvent(2, EVENT_TYPE.HEARING, EventType.Update);

			expect(result).toBe(false);
		});

		it('should return false if appeal not found when deleting a hearing', async () => {
			databaseConnector.hearing.findUnique.mockResolvedValue(null);
			databaseConnector.appeal.findUnique.mockResolvedValue(null);

			const existingHearing = { appealId: 1, hearingStartTime: '2025-01-01' };
			const result = await broadcastEvent(2, EVENT_TYPE.HEARING, EventType.Delete, existingHearing);

			expect(result).toBe(false);
		});
	});
});
