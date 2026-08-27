import { convertFromYesNoToBoolean } from '#lib/boolean-formatter.js';
import { assertValidNumericIds } from '#lib/validators/api-parameters.validator.js';

/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} lpaQuestionnaireId
 * @param {string} updatedData
 * @returns {Promise<{}>}
 */
export function erectionBuildings(apiClient, appealId, lpaQuestionnaireId, updatedData) {
	const ids = assertValidNumericIds({ appealId, lpaQuestionnaireId });
	return apiClient.patch(`appeals/${ids.appealId}/lpa-questionnaires/${ids.lpaQuestionnaireId}`, {
		json: {
			relatesToErectionOfBuildingOrBuildings: convertFromYesNoToBoolean(updatedData)
		}
	});
}
