/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} appellantCaseId
 * @param {string} descriptionOfAllegedBreach
 * @returns {Promise<{}>}
 */
export function changeAllegedBreachDescription(
	apiClient,
	appealId,
	appellantCaseId,
	descriptionOfAllegedBreach
) {
	return apiClient.patch(`appeals/${appealId}/appellant-cases/${appellantCaseId}`, {
		json: {
			descriptionOfAllegedBreach
		}
	});
}
