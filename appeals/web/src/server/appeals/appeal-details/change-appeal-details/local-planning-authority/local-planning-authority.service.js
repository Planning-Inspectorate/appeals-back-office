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
 * @param {number|string} lpaId
 * @returns {Promise <import('../../appeal-details.types.js').LpaChangeRequest>}
 */
export function postChangeLpaRequest(apiClient, appealId, lpaId) {
	return apiClient
		.post(`appeals/${appealId}/lpa`, {
			json: { newLpaId: lpaId }
		})
		.json();
}
