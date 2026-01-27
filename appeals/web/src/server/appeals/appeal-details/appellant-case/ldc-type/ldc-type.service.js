/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} appellantCaseId
 * @param {string} applicationMadeUnderActSection
 * @returns {Promise<{}>}
 */
export function changeApplicationMadeUnderActSection(
	apiClient,
	appealId,
	appellantCaseId,
	applicationMadeUnderActSection
) {
	return apiClient.patch(`appeals/${appealId}/appellant-cases/${appellantCaseId}`, {
		json: {
			applicationMadeUnderActSection: applicationMadeUnderActSection
		}
	});
}
