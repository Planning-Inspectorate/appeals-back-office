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

/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @returns {Promise<{email:string}>}
 */
export async function getTeamFromAppealId(apiClient, appealId) {
	return apiClient.get(`appeals/${appealId}/case-team-email`).json();
}
