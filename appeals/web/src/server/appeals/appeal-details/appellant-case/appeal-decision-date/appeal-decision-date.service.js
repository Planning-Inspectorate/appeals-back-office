/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} appellantCaseId
 * @param {string} appealDecisionDate
 * @returns {Promise<{}>}
 */
export function ChangeAppealDecisionDate(apiClient, appealId, appellantCaseId, appealDecisionDate) {
	return apiClient.patch(`appeals/${appealId}/appellant-cases/${appellantCaseId}`, {
		json: {
			appealDecisionDate
		}
	});
}
