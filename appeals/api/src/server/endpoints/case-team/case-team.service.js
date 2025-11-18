import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';
import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import appealRepository from '#repositories/appeal.repository.js';
import { getAssignedTeam, getTeamFromAppeal } from '#repositories/team.repository.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import {
	AUDIT_TRAIL_ASSIGNED_TEAM_UPDATED,
	CASE_RELATIONSHIP_LINKED
} from '@pins/appeals/constants/support.js';

/**
 *
 * @param {number} appealId
 * @param {number|null} assignedTeamId
 * @param {string|undefined} azureAdUserId
 * @returns
 */
export const setAssignedTeamId = async (appealId, assignedTeamId, azureAdUserId) => {
	const result = await appealRepository.setAssignedTeamId(
		appealId,
		assignedTeamId === 0 ? null : assignedTeamId
	);
	await createAuditTrail({
		appealId: appealId,
		azureAdUserId: azureAdUserId,
		details: stringTokenReplacement(AUDIT_TRAIL_ASSIGNED_TEAM_UPDATED, [
			assignedTeamId ? (await getAssignedTeam(assignedTeamId))?.name || 'unknown' : 'unassigned'
		])
	});
	await broadcasters.broadcastAppeal(appealId);

	return result;
};

/**
 *
 * @param {number} appealId
 * @returns {Promise<string>}
 */
export const getTeamEmailFromAppealId = async (appealId) => {
	const DEFAULT_EMAIL = 'caseofficers@planninginspectorate.gov.uk';
	const team = await getTeamFromAppeal(appealId);
	return team?.email || DEFAULT_EMAIL;
};

/**
 *
 * @param {number} appealId
 * @param {number|null} assignedTeamId
 * @param {string|undefined} azureAdUserId
 * @returns
 */
export const setAssignedTeamIdForLinkedAppeals = async (
	appealId,
	assignedTeamId,
	azureAdUserId
) => {
	const linkedAppeals = await appealRepository.getLinkedAppealsById(
		appealId,
		CASE_RELATIONSHIP_LINKED
	);
	if (linkedAppeals?.length) {
		await Promise.all(
			linkedAppeals.map((linkedAppeal) =>
				// @ts-ignore
				setAssignedTeamId(linkedAppeal.childId, assignedTeamId, azureAdUserId)
			)
		);
	}
};
