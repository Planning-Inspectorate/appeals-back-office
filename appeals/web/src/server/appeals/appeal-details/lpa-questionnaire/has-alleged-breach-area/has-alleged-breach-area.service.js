import { convertFromYesNoToBoolean } from '#lib/boolean-formatter.js';
import { assertValidNumericIds } from '#lib/validators/api-parameters.validator.js';

/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} lpaQuestionnaireId
 * @param {{radio: string, details: string}} updatedData
 * @returns {Promise<{}>}
 */
export function changeAreaOfAllegedBreachInSquareMetres(
	apiClient,
	appealId,
	lpaQuestionnaireId,
	updatedData
) {
	const changeAreaOfAllegedBreachDetails = convertFromYesNoToBoolean(updatedData?.radio)
		? null
		: updatedData?.details;

	const ids = assertValidNumericIds({ appealId, lpaQuestionnaireId });
	return apiClient.patch(`appeals/${ids.appealId}/lpa-questionnaires/${ids.lpaQuestionnaireId}`, {
		json: {
			areaOfAllegedBreachInSquareMetres: changeAreaOfAllegedBreachDetails
		}
	});
}
