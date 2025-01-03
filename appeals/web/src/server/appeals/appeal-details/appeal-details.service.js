/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @returns {Promise<import('./appeal-details.types.js').WebAppeal>}
 */
export function getAppealDetailsFromId(apiClient, appealId) {
	return apiClient.get(`appeals/${appealId}`).json();
}

/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {boolean} eiaScreeningRequired
 * @returns {Promise<import('./appeal-details.types.js').WebAppeal>}
 */
export function setEnvironmentalImpactAssessmentScreening(
	apiClient,
	appealId,
	eiaScreeningRequired
) {
	return apiClient
		.patch(`appeals/${appealId}/eia-screening-required`, {
			json: { eiaScreeningRequired }
		})
		.json();
}
