import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';
import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import { databaseConnector } from '#utils/database-connector.js';
import { AUDIT_TRAIL_REDETERMINATION_STARTED } from '@pins/appeals/constants/support.js';
import { EventType } from '@pins/event-client';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';

/**
 * @param {number} appealId
 * @param {string} azureAdUserId
 * @returns {Promise<*>}
 */
export const redetermineAppeal = async (appealId, azureAdUserId) => {
	const appeal = await databaseConnector.appeal.findUnique({
		where: { id: appealId },
		select: {
			currentStatus: true
		}
	});

	if (!appeal) {
		const error = new Error(`Appeal with ID ${appealId} not found`);
		// @ts-ignore
		error.status = 404;
		throw error;
	}

	if (appeal.currentStatus !== APPEAL_CASE_STATUS.COMPLETE) {
		const error = new Error(`Appeal with ID ${appealId} is not in complete status`);
		// @ts-ignore
		error.status = 400;
		throw error;
	}

	const updatedAppeal = await databaseConnector.$transaction(async (tx) => {
		// 1. Delete quashed inspector decision
		await tx.inspectorDecision.deleteMany({
			where: { appealId }
		});

		// 2. Delete quashed site visit
		await tx.siteVisit.deleteMany({
			where: { appealId }
		});

		// 3. Ensure redetermination/evidence folder exists
		const existingFolder = await tx.folder.findFirst({
			where: {
				caseId: appealId,
				path: 'redetermination/evidence'
			}
		});

		if (!existingFolder) {
			await tx.folder.create({
				data: {
					caseId: appealId,
					path: 'redetermination/evidence'
				}
			});
		}

		// 4. Reset post-event statuses from AppealStatus
		await tx.appealStatus.deleteMany({
			where: {
				appealId,
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

		// Invalidate any other active statuses
		await tx.appealStatus.updateMany({
			where: { appealId },
			data: { valid: false }
		});

		// Create active EVENT status
		await tx.appealStatus.create({
			data: {
				appealId,
				status: APPEAL_CASE_STATUS.EVENT,
				valid: true
			}
		});

		// Update appeal
		return tx.appeal.update({
			where: { id: appealId },
			data: {
				currentStatus: APPEAL_CASE_STATUS.EVENT,
				inspectorUserId: null,
				padsInspectorUserId: null,
				caseCompletedDate: null
			}
		});
	});

	// Create audit trail
	await createAuditTrail({
		appealId,
		azureAdUserId,
		details: AUDIT_TRAIL_REDETERMINATION_STARTED
	});

	// Broadcast appeal update
	await broadcasters.broadcastAppeal(appealId, EventType.Update);

	return updatedAppeal;
};
