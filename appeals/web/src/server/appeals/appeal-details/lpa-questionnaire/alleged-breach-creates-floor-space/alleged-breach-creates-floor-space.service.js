import { convertFromYesNoToBoolean } from '#lib/boolean-formatter.js';
import { assertValidNumericIds } from '#lib/validators/api-parameters.validator.js';

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

	const ids = assertValidNumericIds({ appealId, lpaQuestionnaireId });
	return apiClient.patch(`appeals/${ids.appealId}/lpa-questionnaires/${ids.lpaQuestionnaireId}`, {
		json: {
			floorSpaceCreatedByBreachInSquareMetres: changeAreaOfAllegedFloorSpaceDetails
		}
	});
}
