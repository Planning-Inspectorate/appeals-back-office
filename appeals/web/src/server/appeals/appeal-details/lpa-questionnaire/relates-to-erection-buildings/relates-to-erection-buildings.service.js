import { convertFromYesNoToBoolean } from '#lib/boolean-formatter.js';

/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} lpaQuestionnaireId
 * @param {string} updatedData
 * @returns {Promise<{}>}
 */
export function erectionBuildings(apiClient, appealId, lpaQuestionnaireId, updatedData) {
	return apiClient.patch(`appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`, {
		json: {
			relatesToErectionOfBuildingOrBuildings: convertFromYesNoToBoolean(updatedData)
		}
	});
}
