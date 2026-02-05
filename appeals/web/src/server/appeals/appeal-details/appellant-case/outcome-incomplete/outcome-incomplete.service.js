/**e
 * @param {import('got').Got} apiClient
 * @returns {Promise<any>}
 */
export async function getAppellantCaseEnforcementMissingDocuments(apiClient) {
	return apiClient.get(`appeals/appellant-case-enforcement-missing-documents`).json();
}
