/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} appellantCaseId
 * @param {{ radio: string }} updatedApplicationDecision
 * @returns {Promise<{}>}
 */
export function changeApplicationOutcome(
	apiClient,
	appealId,
	appellantCaseId,
	updatedApplicationDecision
) {
	return apiClient.patch(`appeals/${appealId}/appellant-cases/${appellantCaseId}`, {
		json: {
			applicationDecision: updatedApplicationDecision.radio
		}
	});
}
