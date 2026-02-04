import { convertFromYesNoToBoolean } from '#lib/boolean-formatter.js';

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

	return apiClient.patch(`appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`, {
		json: {
			affectedTrunkRoadName: trunkRoadDetails
		}
	});
}
