/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} appellantCaseId
 * @param {string} enforcementReference
 * @returns {Promise<{}>}
 */
export function changeEnforcementReference(
	apiClient,
	appealId,
	appellantCaseId,
	enforcementReference
) {
	return apiClient.patch(`appeals/${appealId}/appellant-cases/${appellantCaseId}`, {
		json: {
			enforcementReference
		}
	});
}
