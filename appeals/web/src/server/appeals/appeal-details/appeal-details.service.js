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

	const encodedAppealId = encodeURIComponent(appealId);
	const url = include
		? `appeals/${encodedAppealId}?include=${include}`
		: `appeals/${encodedAppealId}`;

	return apiClient.get(url).json();
}

/**
 * @deprecated Inefficient use getAppealDetailsFromId and select only the data needed
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @returns {Promise<import('./appeal-details.types.js').WebAppeal>}
 */
export function deprecatedGetAppealDetailsFromId(apiClient, appealId) {
	const encodedAppealId = encodeURIComponent(appealId);
	const url = `appeals/${encodedAppealId}?include=all`;

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
	const encodedAppealId = encodeURIComponent(appealId);
	return apiClient
		.patch(`appeals/${encodedAppealId}/eia-screening-required`, {
			json: { eiaScreeningRequired }
		})
		.json();
}
