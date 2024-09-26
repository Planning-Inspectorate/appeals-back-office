/** @typedef {import('@pins/appeals.api/src/server/endpoints/appeals').GetCasenotesResponse} GetCasenotesResponse */
/** @typedef {import('@pins/appeals.api/src/server/endpoints/appeals').GetCasenoteResponse} GetCasenoteResponse */
/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @returns {Promise<GetCasenotesResponse>}
 */
export async function getAppealCasenotes(apiClient, appealId) {
	return await apiClient.get(`appeals/${appealId}/casenotes`).json();
}
/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} casenoteId
 * @returns {Promise<GetCasenoteResponse>}
 */
export async function getCasenoteById(apiClient, appealId, casenoteId) {
	return await apiClient.get(`appeals/${appealId}/casenotes/${casenoteId}`).json()
}

/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} comment
 */
export async function postAppealCasenote(apiClient, appealId, comment) {
	return apiClient.post(`appeals/${appealId}/casenotes`, {
		json: {
			comment
		}
	}).json();
}
