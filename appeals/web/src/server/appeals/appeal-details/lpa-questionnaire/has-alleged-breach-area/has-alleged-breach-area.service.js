import { convertFromYesNoToBoolean } from '#lib/boolean-formatter.js';

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

	return apiClient.patch(`appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`, {
		json: {
			areaOfAllegedBreachInSquareMetres: changeAreaOfAllegedBreachDetails
		}
	});
}
