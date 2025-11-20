/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} appellantCaseId
 * @param {boolean} enforcementNoticeListedBuilding
 * @returns {Promise<{}>}
 */
export function changeEnforcementNoticeListedBuilding(
	apiClient,
	appealId,
	appellantCaseId,
	enforcementNoticeListedBuilding
) {
	return apiClient.patch(`appeals/${appealId}/appellant-cases/${appellantCaseId}`, {
		json: {
			enforcementNoticeListedBuilding
		}
	});
}
