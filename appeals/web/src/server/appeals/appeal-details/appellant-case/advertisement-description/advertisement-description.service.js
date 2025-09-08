/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} appellantCaseId
 * @param {string} updatedData
 * @returns {Promise<{}>}
 */
export function changeAdvertisementDescription(apiClient, appealId, appellantCaseId, updatedData) {
	return apiClient.patch(`appeals/${appealId}/appellant-cases/${appellantCaseId}`, {
		json: {
			developmentDescription: {
				details: updatedData
			}
		}
	});
}
