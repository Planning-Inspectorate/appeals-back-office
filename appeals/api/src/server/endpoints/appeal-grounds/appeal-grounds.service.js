import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';
import appealGroundRepository from '#repositories/appeal-ground.repository.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import { AUDIT_TRAIL_ENFORCEMENT_GROUND_UPDATED } from '@pins/appeals/constants/support.js';

/**
 * @param {string} groundRef
 * @param {{isDeleted?: boolean, factsForGround?: string}} data
 * @returns {string}
 */
const getDetails = (groundRef, data) => {
	const { factsForGround = '' } = data;
	return stringTokenReplacement(AUDIT_TRAIL_ENFORCEMENT_GROUND_UPDATED, [
		groundRef,
		factsForGround || ''
	]);
};

/**
 *
 * @param {string} azureAdUserId
 * @param {{appealId: *, groundId: *, isDeleted: boolean, groundRef: string}} appealGround
 * @returns {Promise<Object>}
 */
const updateAppealGround = async (azureAdUserId, appealGround) => {
	const { appealId, groundId, groundRef, ...data } = appealGround;
	const response = appealGroundRepository.updateAppealGroundByAppealIdAndGroundId(
		appealId,
		groundId,
		data
	);

	await createAuditTrail({
		appealId,
		azureAdUserId,
		details: getDetails(groundRef, data)
	});

	return response;
};

export { updateAppealGround };
