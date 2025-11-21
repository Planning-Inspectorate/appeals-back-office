/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} appellantCaseId
 * @param {string} contactPlanningInspectorateDate
 * @returns {Promise<{}>}
 */
export function changeContactPlanningInspectorateDate(
	apiClient,
	appealId,
	appellantCaseId,
	contactPlanningInspectorateDate
) {
	return apiClient.patch(`appeals/${appealId}/appellant-cases/${appellantCaseId}`, {
		json: {
			contactPlanningInspectorateDate
		}
	});
}
