/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} appellantCaseId
 * @param {string} updatedHighwayLand
 * @returns {Promise<{}>}
 */
export function changeHighwayLand(apiClient, appealId, appellantCaseId, updatedHighwayLand) {
	return apiClient.patch(`appeals/${appealId}/appellant-cases/${appellantCaseId}`, {
		json: {
			highwayLand: updatedHighwayLand
		}
	});
}
