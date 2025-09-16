/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} appellantCaseId
 * @param {boolean} updatedValue
 * @returns {Promise<{}>}
 */
export function changeAdvertisementInPosition(apiClient, appealId, appellantCaseId, updatedValue) {
	return apiClient.patch(`appeals/${appealId}/appellant-cases/${appellantCaseId}`, {
		json: {
			advertInPosition: updatedValue
		}
	});
}
