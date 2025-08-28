/**
 * @param {import('got').Got} apiClient
 * @returns {Promise<(import('@pins/appeals.api').Api.CaseTeams)>}
 */
export async function getTeamList(apiClient) {
	return apiClient.get(`appeals/case-teams`).json();
}
