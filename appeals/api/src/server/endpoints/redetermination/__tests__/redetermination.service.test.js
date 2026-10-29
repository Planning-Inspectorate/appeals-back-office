// @ts-nocheck
import { householdAppeal } from '#tests/appeals/mocks.js';
import { azureAdUserId } from '#tests/shared/mocks.js';
import { jest } from '@jest/globals';
import { AUDIT_TRAIL_REDETERMINATION_STARTED } from '@pins/appeals/constants/support.js';
import { EventType } from '@pins/event-client';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';

const { databaseConnector } = await import('#utils/database-connector.js');

jest.unstable_mockModule('#endpoints/audit-trails/audit-trails.service.js', () => ({
	createAuditTrail: jest.fn().mockResolvedValue({})
}));

jest.unstable_mockModule('#endpoints/integrations/integrations.broadcasters.js', () => ({
	broadcasters: {
		broadcastAppeal: jest.fn().mockResolvedValue({})
	}
}));

const { redetermineAppeal } = await import('../redetermination.service.js');
const { createAuditTrail } = await import('#endpoints/audit-trails/audit-trails.service.js');
const { broadcasters } = await import('#endpoints/integrations/integrations.broadcasters.js');

describe('redetermination service', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	it('throws 404 error when appeal is not found', async () => {
		databaseConnector.appeal.findUnique.mockResolvedValue(null);

		await expect(redetermineAppeal(999, azureAdUserId)).rejects.toMatchObject({
			status: 404,
			message: 'Appeal with ID 999 not found'
		});
	});

	it('throws 400 error when appeal is not in complete status', async () => {
		const incompleteAppeal = {
			...householdAppeal,
			id: 1,
			currentStatus: APPEAL_CASE_STATUS.EVENT
		};
		databaseConnector.appeal.findUnique.mockResolvedValue(incompleteAppeal);

		await expect(redetermineAppeal(1, azureAdUserId)).rejects.toMatchObject({
			status: 400,
			message: 'Appeal with ID 1 is not in complete status'
		});
	});

	it('successfully clears decision & site visit, resets status to event, provisions folder, and logs audit trail', async () => {
		const completedAppeal = {
			...householdAppeal,
			id: 1,
			currentStatus: APPEAL_CASE_STATUS.COMPLETE,
			appealStatus: [
				{ status: APPEAL_CASE_STATUS.VALIDATION, valid: false },
				{ status: APPEAL_CASE_STATUS.EVENT, valid: false },
				{ status: APPEAL_CASE_STATUS.AWAITING_EVENT, valid: false },
				{ status: APPEAL_CASE_STATUS.ISSUE_DETERMINATION, valid: false },
				{ status: APPEAL_CASE_STATUS.COMPLETE, valid: true }
			],
			siteVisit: { id: 10, appealId: 1 },
			inspectorDecision: { id: 20, appealId: 1, outcome: 'allowed' }
		};

		databaseConnector.appeal.findUnique.mockResolvedValue(completedAppeal);

		const mockTx = {
			inspectorDecision: { deleteMany: jest.fn().mockResolvedValue({ count: 1 }) },
			siteVisit: { deleteMany: jest.fn().mockResolvedValue({ count: 1 }) },
			folder: {
				findFirst: jest.fn().mockResolvedValue(null),
				create: jest
					.fn()
					.mockResolvedValue({ id: 100, caseId: 1, path: 'redetermination/evidence' })
			},
			appealStatus: {
				deleteMany: jest.fn().mockResolvedValue({ count: 4 }),
				updateMany: jest.fn().mockResolvedValue({ count: 1 }),
				create: jest
					.fn()
					.mockResolvedValue({ id: 2, status: APPEAL_CASE_STATUS.EVENT, valid: true })
			},
			appeal: {
				update: jest.fn().mockResolvedValue({
					...completedAppeal,
					currentStatus: APPEAL_CASE_STATUS.EVENT,
					inspectorUserId: null,
					padsInspectorUserId: null,
					caseCompletedDate: null
				})
			}
		};

		databaseConnector.$transaction = jest
			.fn()
			.mockImplementation(async (callback) => callback(mockTx));

		const result = await redetermineAppeal(1, azureAdUserId);

		// Assert deletions
		expect(mockTx.inspectorDecision.deleteMany).toHaveBeenCalledWith({ where: { appealId: 1 } });
		expect(mockTx.siteVisit.deleteMany).toHaveBeenCalledWith({ where: { appealId: 1 } });

		// Assert folder creation
		expect(mockTx.folder.findFirst).toHaveBeenCalledWith({
			where: { caseId: 1, path: 'redetermination/evidence' }
		});
		expect(mockTx.folder.create).toHaveBeenCalledWith({
			data: { caseId: 1, path: 'redetermination/evidence' }
		});

		// Assert status resets
		expect(mockTx.appealStatus.deleteMany).toHaveBeenCalledWith({
			where: {
				appealId: 1,
				status: {
					in: [
						APPEAL_CASE_STATUS.EVENT,
						APPEAL_CASE_STATUS.AWAITING_EVENT,
						APPEAL_CASE_STATUS.ISSUE_DETERMINATION,
						APPEAL_CASE_STATUS.COMPLETE
					]
				}
			}
		});
		expect(mockTx.appealStatus.updateMany).toHaveBeenCalledWith({
			where: { appealId: 1 },
			data: { valid: false }
		});
		expect(mockTx.appealStatus.create).toHaveBeenCalledWith({
			data: {
				appealId: 1,
				status: APPEAL_CASE_STATUS.EVENT,
				valid: true
			}
		});

		// Assert appeal update
		expect(mockTx.appeal.update).toHaveBeenCalledWith({
			where: { id: 1 },
			data: {
				currentStatus: APPEAL_CASE_STATUS.EVENT,
				inspectorUserId: null,
				padsInspectorUserId: null,
				caseCompletedDate: null
			}
		});

		// Assert audit trail & broadcast
		expect(createAuditTrail).toHaveBeenCalledWith({
			appealId: 1,
			azureAdUserId,
			details: AUDIT_TRAIL_REDETERMINATION_STARTED
		});
		expect(broadcasters.broadcastAppeal).toHaveBeenCalledWith(1, EventType.Update);

		expect(result.currentStatus).toBe(APPEAL_CASE_STATUS.EVENT);
	});
});
