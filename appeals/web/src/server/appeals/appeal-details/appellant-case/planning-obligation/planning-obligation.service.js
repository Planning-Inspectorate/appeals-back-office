/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} appellantCaseId
 * @param {string|null} updatedPlanningObligationStatus
 * @returns {Promise<{}>}
 */
export function changePlanningObligationStatus(
	apiClient,
	appealId,
	appellantCaseId,
	updatedPlanningObligationStatus
) {
	return apiClient.patch(`appeals/${appealId}/appellant-cases/${appellantCaseId}`, {
		json: {
			statusPlanningObligation: updatedPlanningObligationStatus
		}
	});
}
