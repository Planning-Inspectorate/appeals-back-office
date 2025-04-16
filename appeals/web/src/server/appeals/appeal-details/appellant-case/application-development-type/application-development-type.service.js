/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} appellantCaseId
 * @param {string | null} developmentType
 * @returns {Promise<{}>}
 */
export function changeDevelopmentType(apiClient, appealId, appellantCaseId, developmentType) {
	return apiClient.patch(`appeals/${appealId}/appellant-cases/${appellantCaseId}`, {
		json: {
			developmentType
		}
	});
}
