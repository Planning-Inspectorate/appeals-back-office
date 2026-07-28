/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} caseDecisionOutcomeDate
 * @returns {Promise<{}>}
 */
export function updateCaseDecisionOutcomeDate(apiClient, appealId, caseDecisionOutcomeDate) {
	return apiClient
		.patch(`appeals/${appealId}/decision/caseDecisionOutcomeDate`, {
			json: { caseDecisionOutcomeDate }
		})
		.json()
		.catch((error) => error?.response?.body || error);
}
