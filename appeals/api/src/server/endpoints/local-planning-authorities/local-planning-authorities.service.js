import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';
import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import lpaRepository from '#repositories/lpa.repository.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import { AUDIT_TRAIL_LPA_UPDATED } from '@pins/appeals/constants/support.js';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */

/**
 * @param {Appeal} appeal
 * @param {number} newLpaId
 * @param {string|undefined} azureAdUserId
 * @returns {Promise<void>}
 */
const changeLpa = async (appeal, newLpaId, azureAdUserId) => {
	await lpaRepository.updateLpaByAppealId(appeal, newLpaId);
	const newLpaDetails = await lpaRepository.getLpaById(newLpaId);

	await createAuditTrail({
		appealId: appeal.id,
		azureAdUserId,
		details: stringTokenReplacement(AUDIT_TRAIL_LPA_UPDATED, [newLpaDetails?.name || ''])
	});

	await broadcasters.broadcastAppeal(appeal.id);
};

export const lpaService = {
	changeLpa
};
