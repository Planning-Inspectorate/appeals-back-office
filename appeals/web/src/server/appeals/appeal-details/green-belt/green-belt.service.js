import { convertFromYesNoToBoolean } from '#lib/boolean-formatter.js';
import { assertValidNumericIds } from '#lib/validators/api-parameters.validator.js';

/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} appellantCaseId
 * @param {string} updatedGreenBelt
 * @returns {Promise<{}>}
 */
export function changeGreenBeltAppellant(apiClient, appealId, appellantCaseId, updatedGreenBelt) {
	const formattedGreenBelt = convertFromYesNoToBoolean(updatedGreenBelt);

	const ids = assertValidNumericIds({ appealId, appellantCaseId });
	return apiClient.patch(`appeals/${ids.appealId}/appellant-cases/${ids.appellantCaseId}`, {
		json: {
			isGreenBelt: formattedGreenBelt
		}
	});
}

/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} lpaQuestionnaireId
 * @param {string} updatedGreenBelt
 * @returns {Promise<{}>}
 */
export function changeGreenBeltLPA(apiClient, appealId, lpaQuestionnaireId, updatedGreenBelt) {
	const formattedGreenBelt = convertFromYesNoToBoolean(updatedGreenBelt);

	const ids = assertValidNumericIds({ appealId, lpaQuestionnaireId });
	return apiClient.patch(`appeals/${ids.appealId}/lpa-questionnaires/${ids.lpaQuestionnaireId}`, {
		json: {
			isGreenBelt: formattedGreenBelt
		}
	});
}
