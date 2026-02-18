import { convertFromYesNoToBoolean } from '#lib/boolean-formatter.js';

/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} lpaQuestionnaireId
 * @param {{radio: string, details: string}} updatedData
 * @returns {Promise<{}>}
 */
export function changeFloorSpaceCreatedByBreachInSquareMetres(
	apiClient,
	appealId,
	lpaQuestionnaireId,
	updatedData
) {
	let changeAreaOfAllegedFloorSpaceDetails;

	if (convertFromYesNoToBoolean(updatedData?.radio)) {
		changeAreaOfAllegedFloorSpaceDetails = parseFloat(updatedData?.details);
	} else {
		changeAreaOfAllegedFloorSpaceDetails = null;
	}

	return apiClient.patch(`appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`, {
		json: {
			floorSpaceCreatedByBreachInSquareMetres: changeAreaOfAllegedFloorSpaceDetails
		}
	});
}
