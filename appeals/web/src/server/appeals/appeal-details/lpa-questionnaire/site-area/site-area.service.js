import { assertValidNumericIds } from '#lib/validators/api-parameters.validator.js';
/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} lpaQuestionnaireId
 * @param {string} updatedSiteArea
 * @returns {Promise<{}>}
 */
export function changeSiteArea(apiClient, appealId, lpaQuestionnaireId, updatedSiteArea) {
	const ids = assertValidNumericIds({ appealId, lpaQuestionnaireId });
	return apiClient.patch(`appeals/${ids.appealId}/lpa-questionnaires/${ids.lpaQuestionnaireId}`, {
		json: {
			siteAreaSquareMetres: updatedSiteArea
		}
	});
}
