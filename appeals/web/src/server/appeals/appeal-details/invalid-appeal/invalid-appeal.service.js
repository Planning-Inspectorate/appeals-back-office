/**
 * @param {import('got').Got} apiClient
 * @param {number} appealId
 */
export async function getInvalidStatusCreatedDate(apiClient, appealId) {
	return apiClient.get(`appeals/${appealId}/appeal-status/invalid/created-date`).json();
}
