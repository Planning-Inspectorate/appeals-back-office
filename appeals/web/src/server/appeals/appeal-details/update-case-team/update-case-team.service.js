import { assertValidNumericIds } from '#lib/validators/api-parameters.validator.js';
/**
 * @param {import('got').Got} apiClient
 * @returns {Promise<(import('@pins/appeals.api').Api.CaseTeams)>}
 */
export async function getTeamList(apiClient) {
	return apiClient.get(`appeals/case-teams`).json();
}

/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {number} teamId
 * @returns {Promise<{}>}
 */
export async function postUpdateTeam(apiClient, appealId, teamId) {
	const ids = assertValidNumericIds({ appealId });
	return apiClient.patch(`appeals/${ids.appealId}/case-team`, {
		json: {
			teamId: teamId
		}
	});
}

/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @returns {Promise<{email:string}>}
 */
export async function getTeamFromAppealId(apiClient, appealId) {
	const ids = assertValidNumericIds({ appealId });
	return apiClient.get(`appeals/${ids.appealId}/case-team-email`).json();
}
