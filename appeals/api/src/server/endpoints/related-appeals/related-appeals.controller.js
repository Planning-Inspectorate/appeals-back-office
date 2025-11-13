import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';
import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import appealRepository from '#repositories/appeal.repository.js';
import { AUDIT_TRAIL_APPEAL_RELATION_REMOVED } from '@pins/appeals/constants/support.js';
import { getRelatableAppealSummaryByCaseReference } from './related-appeals.service.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const getRelatableAppealById = async (req, res) => {
	const { appealReference } = req.params;

	try {
		const relatableAppeal = await getRelatableAppealSummaryByCaseReference(appealReference);

		if (relatableAppeal.source === 'horizon') {
			return res.send(relatableAppeal);
		}

		return res.send(relatableAppeal);
	} catch (/** @type {*} */ statusCode) {
		return res.status(typeof statusCode === 'number' ? statusCode : 500).end();
	}
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const unrelateAppeal = async (req, res) => {
	const { relationshipId } = req.body;
	const currentAppeal = req.appeal;
	await appealRepository.unlinkAppeal(relationshipId);
	await createAuditTrail({
		appealId: currentAppeal.id,
		azureAdUserId: req.get('azureAdUserId'),
		details: AUDIT_TRAIL_APPEAL_RELATION_REMOVED
	});

	await broadcasters.broadcastAppeal(currentAppeal.id);
	return res.status(200).send(true);
};
