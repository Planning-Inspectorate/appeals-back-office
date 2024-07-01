/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} appellantCaseId
 * @param {string} updatedDate
 * @returns {Promise<{}>}
 */
export function changeApplicationSubmissionDate(apiClient, appealId, appellantCaseId, updatedDate) {
	const formattedDate = new Date(updatedDate).toISOString();
	return apiClient.patch(`appeals/${appealId}/appellant-cases/${appellantCaseId}`, {
		json: {
			...{ applicationDate: formattedDate }
		}
	});
}
