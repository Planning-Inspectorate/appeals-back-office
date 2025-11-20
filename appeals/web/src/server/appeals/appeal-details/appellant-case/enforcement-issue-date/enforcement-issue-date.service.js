/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} appellantCaseId
 * @param {string} enforcementIssueDate
 * @returns {Promise<{}>}
 */
export function changeEnforcementIssueDate(
	apiClient,
	appealId,
	appellantCaseId,
	enforcementIssueDate
) {
	return apiClient.patch(`appeals/${appealId}/appellant-cases/${appellantCaseId}`, {
		json: {
			enforcementIssueDate
		}
	});
}
