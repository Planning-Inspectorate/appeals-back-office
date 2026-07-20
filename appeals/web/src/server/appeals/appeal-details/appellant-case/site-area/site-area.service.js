import { assertValidNumericIds } from '#lib/validators/api-parameters.validator.js';
/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} appellantCaseId
 * @param {string} updatedSiteArea
 * @returns {Promise<{}>}
 */
export function changeSiteArea(apiClient, appealId, appellantCaseId, updatedSiteArea) {
	const ids = assertValidNumericIds({ appealId, appellantCaseId });
	return apiClient.patch(`appeals/${ids.appealId}/appellant-cases/${ids.appellantCaseId}`, {
		json: {
			siteAreaSquareMetres: updatedSiteArea
		}
	});
}
