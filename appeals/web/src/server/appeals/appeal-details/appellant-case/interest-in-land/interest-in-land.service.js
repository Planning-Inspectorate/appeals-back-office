/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} appellantCaseId
 * @param {string} updatedValue
 * @returns {Promise<{}>}
 */
export function changeInterestInLand(apiClient, appealId, appellantCaseId, updatedValue) {
	return apiClient.patch(`appeals/${appealId}/appellant-cases/${appellantCaseId}`, {
		json: {
			interestInLand: updatedValue
		}
	});
}
