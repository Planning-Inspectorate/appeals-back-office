/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} [include]
 * @returns {Promise<import('./appeal-details.types.js').WebAppeal>}
 */
export function getAppealDetailsFromId(apiClient, appealId, include) {
	if (include === 'all') {
		throw new Error('include=all is not allowed, select only the keys needed');
	}

	const url = include ? `appeals/${appealId}?include=${include}` : `appeals/${appealId}`;

	return apiClient.get(url).json();
}

/**
 * @deprecated Inefficient use getAppealDetailsFromId and select only the data needed
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @returns {Promise<import('./appeal-details.types.js').WebAppeal>}
 */
export function deprecatedGetAppealDetailsFromId(apiClient, appealId) {
	const url = `appeals/${appealId}?include=all`;

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
