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
	return apiClient.patch(`appeals/${appealId}/case-team`, {
		json: {
			teamId: teamId
		}
	});
}
