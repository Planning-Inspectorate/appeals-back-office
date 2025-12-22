import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';
import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import transitionState from '#state/transition-state.js';
import { isCurrentStatus } from '#utils/current-status.js';
import { databaseConnector } from '#utils/database-connector.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import {
	AUDIT_TRAIL_APPEAL_TYPE_TRANSFERRED,
	AUDIT_TRAIL_HORIZON_REFERENCE_UPDATED
} from '@pins/appeals/constants/support.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import { addDays } from 'date-fns';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */

/**
 * @param {Appeal} appeal
 * @param {string} newAppealReference
 * @param {string} azureAdUserId
 * @returns {Promise<void>}
 */
const markTransferred = async (appeal, newAppealReference, azureAdUserId) => {
	await databaseConnector.appeal.update({
		where: { id: appeal.id },
		data: {
			caseTransferredId: newAppealReference,
			caseUpdatedDate: new Date()
		}
	});

	let details;

	if (isCurrentStatus(appeal, APPEAL_CASE_STATUS.AWAITING_TRANSFER)) {
		await transitionState(appeal.id, azureAdUserId, APPEAL_CASE_STATUS.TRANSFERRED);
		details = stringTokenReplacement(AUDIT_TRAIL_APPEAL_TYPE_TRANSFERRED, ['transferred']);
	} else {
		details = AUDIT_TRAIL_HORIZON_REFERENCE_UPDATED;
	}

	await createAuditTrail({
		appealId: appeal.id,
		azureAdUserId,
		details
	});

	await broadcasters.broadcastAppeal(appeal.id);
};

/**
 * @param {number} appealId
 * @param {number} newAppealTypeId
 * @param {string} azureAdUserId
 * @returns {Promise<void>}
 */
const markAwaitingTransfer = async (appealId, newAppealTypeId, azureAdUserId) => {
	const currentDate = new Date();
	const caseExtensionDate = await addDays(currentDate, 5);

	/** @type {Partial<import('#db-client/models.ts').AppealUpdateInput>} data */
	const data = {
		caseResubmittedTypeId: newAppealTypeId,
		caseUpdatedDate: new Date(),
		caseExtensionDate
	};

	Promise.all([
		await databaseConnector.appeal.update({
			where: { id: appealId },
			data
		}),
		await transitionState(appealId, azureAdUserId, APPEAL_CASE_STATUS.AWAITING_TRANSFER)
	]);

	await createAuditTrail({
		appealId,
		azureAdUserId,
		details: stringTokenReplacement(AUDIT_TRAIL_APPEAL_TYPE_TRANSFERRED, ['awaiting transfer'])
	});

	await broadcasters.broadcastAppeal(appealId);
};

export { markAwaitingTransfer, markTransferred };
