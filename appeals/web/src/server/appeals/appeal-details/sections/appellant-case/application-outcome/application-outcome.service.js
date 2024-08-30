/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} appellantCaseId
 * @param {string | null} applicationOutcome
 * @returns {Promise<{}>}
 */
export function changeApplicationOutcome(apiClient, appealId, appellantCaseId, applicationOutcome) {
	return apiClient.patch(`appeals/${appealId}/appellant-cases/${appellantCaseId}`, {
		json: {
			applicationDecision: applicationOutcome
		}
	});
}
