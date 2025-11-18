/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} [include]
 * @returns {Promise<import('./appeal-details.types.js').WebAppeal>}
 */
export function getAppealDetailsFromId(apiClient, appealId, include) {
	const url = include
		? `appeals/${appealId}?include=${include}`
		: `appeals/${appealId}?include=all`;

	return apiClient.get(url).json();
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
