/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';
import { updateEiaScreeningRequirement } from '#endpoints/environmental-impact-assessment/environmental-impact-assessment.service.js';
import { isLinkedAppealsActive } from '#utils/is-linked-appeal.js';
import logger from '#utils/logger.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import {
	AUDIT_TRAIL_ENVIRONMENTAL_SERVICES_TEAM_REVIEW,
	CASE_RELATIONSHIP_LINKED
} from '@pins/appeals/constants/support.js';

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const patchEiaScreeningRequired = async (req, res) => {
	const { appeal } = req;
	try {
		let appealsIdsToUpdate = [appeal.id];
		const childAppeals = appeal.childAppeals;
		if (isLinkedAppealsActive(appeal)) {
			childAppeals?.forEach((childAppeal) => {
				if (childAppeal.type === CASE_RELATIONSHIP_LINKED && childAppeal.childId !== null) {
					appealsIdsToUpdate.push(childAppeal.childId);
				}
			});
		}
		const eiaScreeningRequired = await updateEiaScreeningRequirement(
			req.body.eiaScreeningRequired,
			appealsIdsToUpdate
		);
		if (eiaScreeningRequired === null || eiaScreeningRequired.count === 0) {
			return res.status(404).send({ errors: { eiaScreeningRequired: 'Appeal not found' } });
		}
		await createAuditTrail({
			appealId: appeal.id,
			details: stringTokenReplacement(AUDIT_TRAIL_ENVIRONMENTAL_SERVICES_TEAM_REVIEW, [appeal.id]),
			azureAdUserId: req.get('azureAdUserId')
		});
		return res.send(true);
	} catch (error) {
		logger.error('Error updating EIA screening requirement:', error);
		return res.status(500).send({ errors: { eiaScreeningRequired: 'Internal server error' } });
	}
};
