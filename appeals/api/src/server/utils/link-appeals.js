import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';
import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import appealRepository from '#repositories/appeal.repository.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import { updatePersonalList } from '#utils/update-personal-list.js';
import {
	AUDIT_TRAIL_APPEAL_LINK_ADDED,
	CASE_RELATIONSHIP_LINKED
} from '@pins/appeals/constants/support.js';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */

/**
 *
 * @param {string|undefined} azureAdUserId
 * @param {Partial<Appeal>} parentAppeal
 * @param {Partial<Appeal>} childAppeal
 * @returns {Promise<void>}
 */
export const linkAppeals = async (azureAdUserId, parentAppeal, childAppeal) => {
	const relationship = {
		parentId: parentAppeal.id,
		parentRef: parentAppeal.reference,
		childId: childAppeal.id,
		childRef: childAppeal.reference,
		type: CASE_RELATIONSHIP_LINKED,
		externalSource: false
	};

	if (!relationship.parentId || !relationship.childId) {
		return;
	}

	// @ts-ignore
	await appealRepository.linkAppeal(relationship);

	await Promise.all([
		await updatePersonalList(relationship.parentId),

		await updatePersonalList(relationship.childId),

		createAuditTrail({
			appealId: relationship.parentId,
			azureAdUserId,
			details: stringTokenReplacement(AUDIT_TRAIL_APPEAL_LINK_ADDED, [relationship.childRef || ''])
		}),

		createAuditTrail({
			appealId: relationship.childId,
			azureAdUserId,
			details: stringTokenReplacement(AUDIT_TRAIL_APPEAL_LINK_ADDED, [relationship.parentRef || ''])
		})
	]);

	await Promise.all(
		[relationship.parentId, relationship.childId].map((id) => broadcasters.broadcastAppeal(id))
	);
};
