/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} lpaQuestionnaireId
 * @param {string} updatedSiteArea
 * @returns {Promise<{}>}
 */
export function changeSiteArea(apiClient, appealId, lpaQuestionnaireId, updatedSiteArea) {
	return apiClient.patch(`appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`, {
		json: {
			siteAreaSquareMetres: updatedSiteArea
		}
	});
}
