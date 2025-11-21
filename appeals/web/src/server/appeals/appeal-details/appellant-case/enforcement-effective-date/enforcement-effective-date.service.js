/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} appellantCaseId
 * @param {string} enforcementEffectiveDate
 * @returns {Promise<{}>}
 */
export function changeEnforcementEffectiveDate(
	apiClient,
	appealId,
	appellantCaseId,
	enforcementEffectiveDate
) {
	return apiClient.patch(`appeals/${appealId}/appellant-cases/${appellantCaseId}`, {
		json: {
			enforcementEffectiveDate
		}
	});
}
