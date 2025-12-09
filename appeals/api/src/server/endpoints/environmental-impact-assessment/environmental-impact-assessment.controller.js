/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';
import { updateEiaScreeningRequirement } from '#endpoints/environmental-impact-assessment/environmental-impact-assessment.service.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import { AUDIT_TRAIL_ENVIRONMENTAL_SERVICES_TEAM_REVIEW } from '@pins/appeals/constants/support.js';

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const patchEiaScreeningRequired = async (req, res) => {
	const { appeal } = req;

	const eiaScreeningRequired = await updateEiaScreeningRequirement(
		appeal.id,
		req.body.eiaScreeningRequired
	);
	await createAuditTrail({
		appealId: appeal.id,
		details: stringTokenReplacement(AUDIT_TRAIL_ENVIRONMENTAL_SERVICES_TEAM_REVIEW, [appeal.id]),
		azureAdUserId: req.get('azureAdUserId')
	});

	return res.send(eiaScreeningRequired);
};
