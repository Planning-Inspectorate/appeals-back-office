/**
 * @param {import('got').Got} apiClient
 * @returns {Promise <import('../../appeal-details.types.js').Lpa[]>}
 */
export function getLpaList(apiClient) {
	return apiClient.get(`appeals/local-planning-authorities`).json();
}

/**
 * @param {import('got').Got} apiClient
 * @param {number|string} appealId
 * @returns {Promise <import('../../appeal-details.types.js').Lpa>}
 */
export function getLpaFromAppealId(apiClient, appealId) {
	return apiClient.get(`appeals/${appealId}/lpa`).json();
}
