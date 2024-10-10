/** @typedef {import('@pins/appeals.api/src/server/endpoints/appeals').GetCaseNotesResponse} GetCaseNotesResponse */
/** @typedef {import('@pins/appeals.api/src/server/endpoints/appeals').GetCaseNoteResponse} GetCaseNoteResponse */
/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @returns {Promise<GetCaseNotesResponse>}
 */
export async function getAppealCaseNotes(apiClient, appealId) {
	return await apiClient.get(`appeals/${appealId}/case-notes`).json();
}

/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} comment
 */
export async function postAppealCaseNote(apiClient, appealId, comment) {
	return apiClient
		.post(`appeals/${appealId}/case-notes`, {
			json: {
				comment
			}
		})
		.json();
}
