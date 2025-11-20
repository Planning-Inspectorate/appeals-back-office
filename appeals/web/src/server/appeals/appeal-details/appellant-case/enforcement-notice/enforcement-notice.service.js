/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} appellantCaseId
 * @param {boolean} enforcementNotice
 * @returns {Promise<{}>}
 */
export function changeEnforcementNotice(apiClient, appealId, appellantCaseId, enforcementNotice) {
	return apiClient.patch(`appeals/${appealId}/appellant-cases/${appellantCaseId}`, {
		json: {
			enforcementNotice
		}
	});
}
