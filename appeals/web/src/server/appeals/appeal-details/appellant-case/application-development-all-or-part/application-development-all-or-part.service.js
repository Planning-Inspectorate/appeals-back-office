/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} appellantCaseId
 * @param {string} applicationDevelopmentAllOrPart
 * @returns {Promise<{}>}
 */
export function changeApplicationDevelopmentAllOrPart(
	apiClient,
	appealId,
	appellantCaseId,
	applicationDevelopmentAllOrPart
) {
	return apiClient.patch(`appeals/${appealId}/appellant-cases/${appellantCaseId}`, {
		json: {
			applicationDevelopmentAllOrPart
		}
	});
}
