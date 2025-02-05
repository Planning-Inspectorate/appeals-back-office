/**
 *
 * @param {import('got').Got} apiClient
 * @returns {Promise<import('@pins/appeals.api/src/server/openapi-types.js').DesignatedSiteName[]>}
 */
export function getDesignatedSiteNames(apiClient) {
	return apiClient.get(`appeals/lpa-designated-sites`).json();
}

/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} lpaQuestionnaireId
 * @param {(import('@pins/appeals.api/src/server/openapi-types.js').DesignatedSiteName|undefined)[]} designatedSiteNames
 * @returns {Promise<{}>}
 */
export function changeInNearOrLikelyToAffectDesignatedSites(
	apiClient,
	appealId,
	lpaQuestionnaireId,
	designatedSiteNames
) {
	return apiClient.patch(`appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`, {
		json: {
			designatedSiteNames
		}
	});
}
