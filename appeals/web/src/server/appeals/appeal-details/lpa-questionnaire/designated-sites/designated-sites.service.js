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
 * @param {import('@pins/appeals.api/src/server/openapi-types.js').DesignatedSiteName[]} mappedInputData
 * @returns {Promise<{}>}
 */
export function changeInNearOrLikelyToAffectDesignatedSites(
	apiClient,
	appealId,
	lpaQuestionnaireId,
	mappedInputData
) {
	return apiClient.patch(`appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`, {
		json: {
			designatedSiteNames: mappedInputData
		}
	});
}
