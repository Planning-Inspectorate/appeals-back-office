import { convertFromYesNoToBoolean } from '#lib/boolean-formatter.js';
import { assertValidNumericIds } from '#lib/validators/api-parameters.validator.js';

/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} lpaQuestionnaireId
 * @param {{radio: string, details: string}} updatedTrunkRoad
 * @returns {Promise<{}>}
 */
export function changeTrunkRoad(apiClient, appealId, lpaQuestionnaireId, updatedTrunkRoad) {
	let trunkRoadDetails;
	trunkRoadDetails = updatedTrunkRoad.details;

	if (!convertFromYesNoToBoolean(updatedTrunkRoad.radio)) {
		trunkRoadDetails = null;
	}

	const ids = assertValidNumericIds({ appealId, lpaQuestionnaireId });
	return apiClient.patch(`appeals/${ids.appealId}/lpa-questionnaires/${ids.lpaQuestionnaireId}`, {
		json: {
			affectedTrunkRoadName: trunkRoadDetails
		}
	});
}
