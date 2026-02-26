/**
 * @param {import('got').Got} apiClient
 * @returns {Promise<any>}
 */
export async function getAppellantCaseEnforcementMissingDocuments(apiClient) {
	return apiClient.get(`appeals/appellant-case-enforcement-missing-documents`).json();
}

/**
 * @param {import('got').Got} apiClient
 * @returns {Promise<any>}
 */
export async function getAppellantCaseEnforcementGroundsMismatch(apiClient) {
	return apiClient.get(`appeals/appellant-case-enforcement-grounds-mismatch-facts`).json();
}
