/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} appellantCaseId
 * @param {number | null} numberOfResidencesNetChange
 * @returns {Promise<{}>}
 */
export function changeNumberOfResidencesNetChange(
	apiClient,
	appealId,
	appellantCaseId,
	numberOfResidencesNetChange
) {
	return apiClient.patch(`appeals/${appealId}/appellant-cases/${appellantCaseId}`, {
		json: {
			numberOfResidencesNetChange: numberOfResidencesNetChange
		}
	});
}
