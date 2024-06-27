/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} appellantCaseId
 * @param {string} updatedSiteArea
 * @returns {Promise<{}>}
 */
export function changeSiteArea(apiClient, appealId, appellantCaseId, updatedSiteArea) {
	return apiClient.patch(`appeals/${appealId}/appellant-cases/${appellantCaseId}`, {
		json: {
			siteAreaSquareMetres: updatedSiteArea
		}
	});
}
