/**
 * @param {any} apiClient
 * @param {string} appealId
 * @param {Object} sessionValues
 * @returns {Promise<*>}
 */
export async function postProcedureChangeRequest(apiClient, appealId, sessionValues) {
	return await apiClient
		.post(`appeals/${appealId}/procedure-type-change-request`, {
			json: {
				sessionValues: sessionValues
			}
		})
		.json();
}
