import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';
import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import appealRepository from '#repositories/appeal.repository.js';
import { isParentAppeal } from '#utils/is-linked-appeal.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import { setPersonalList } from '#utils/update-personal-list.js';
import {
	AUDIT_TRAIL_APPEAL_LINK_ADDED,
	CASE_RELATIONSHIP_LINKED
} from '@pins/appeals/constants/support.js';
import { APPEAL_CASE_TYPE } from '@planning-inspectorate/data-model';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */

/**
 *
 * @param {Partial<Appeal> | undefined} appeal
 * @returns {Partial<Appeal>[]}
 */
export const getChildAppeals = (appeal) =>
	// @ts-ignore
	appeal?.childAppeals
		?.filter(({ type, child }) => type === CASE_RELATIONSHIP_LINKED && child)
		.map(({ child }) => child) || [];

/**
 *
 * @param {Partial<Appeal> | undefined} appeal
 * @returns {Partial<Appeal> | null | undefined}
 */
export const getLeadAppeal = (appeal) => {
	if (isParentAppeal(appeal)) {
		return appeal;
	}
	return appeal?.parentAppeals?.[0]?.parent;
};

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
		await setPersonalList({ appealId: relationship.parentId }),

		await setPersonalList({ appealId: relationship.childId }),

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

/**
 *
 * @param {Partial<Appeal> | undefined} appeal
 * @returns {Promise<{ reference: string | undefined, grounds: string[] }[]>}
 */
export const getChildEnforcementsWithGrounds = async (appeal) => {
	let childEnforcementWithGrounds = [];
	if (appeal?.appealType?.key === APPEAL_CASE_TYPE.C) {
		for (const childAppeal of getChildAppeals(appeal)) {
			if (childAppeal.appealType?.key === APPEAL_CASE_TYPE.C) {
				const childWithInfo = await appealRepository.getAppealById(Number(childAppeal.id), true, [
					'appealGrounds'
				]);
				childEnforcementWithGrounds.push({
					reference: childAppeal.reference,
					grounds:
						childWithInfo?.appealGrounds?.map((ground) => ground.ground?.groundRef || '').sort() ||
						[]
				});
			}
		}
		childEnforcementWithGrounds?.sort(
			(a, b) => parseInt(a.reference ?? '0') - parseInt(b.reference ?? '0')
		);
	}
	return childEnforcementWithGrounds;
};
