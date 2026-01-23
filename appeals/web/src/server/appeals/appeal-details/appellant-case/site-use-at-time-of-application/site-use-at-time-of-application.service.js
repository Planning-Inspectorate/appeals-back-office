/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} appellantCaseId
 * @param {string} siteUseAtTimeOfApplication
 * @returns {Promise<{}>}
 */
export function changeSiteUseAtTimeOfApplication(
	apiClient,
	appealId,
	appellantCaseId,
	siteUseAtTimeOfApplication
) {
	return apiClient.patch(`appeals/${appealId}/appellant-cases/${appellantCaseId}`, {
		json: {
			siteUseAtTimeOfApplication: siteUseAtTimeOfApplication
		}
	});
}
