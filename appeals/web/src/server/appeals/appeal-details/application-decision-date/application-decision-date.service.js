/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} appellantCaseId
 * @param {string | null} updatedDate
 * @returns {Promise<{}>}
 */
export function changeApplicationDecisionDate(apiClient, appealId, appellantCaseId, updatedDate) {
	const formattedDate = updatedDate ? new Date(updatedDate).toISOString() : updatedDate;
	return apiClient.patch(`appeals/${appealId}/appellant-cases/${appellantCaseId}`, {
		json: {
			applicationDecisionDate: formattedDate
		}
	});
}
('day-month-year');
