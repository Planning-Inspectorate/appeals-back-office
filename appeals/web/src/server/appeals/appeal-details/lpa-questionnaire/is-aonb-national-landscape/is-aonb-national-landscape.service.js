import { convertFromYesNoToBoolean } from '#lib/boolean-formatter.js';
import { assertValidNumericIds } from '#lib/validators/api-parameters.validator.js';

/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} lpaQuestionnaireId
 * @param {string} inputData
 * @returns {Promise<{}>}
 */
export function changeIsAonbNationalLandscape(apiClient, appealId, lpaQuestionnaireId, inputData) {
	const formattedValue = convertFromYesNoToBoolean(inputData);

	const ids = assertValidNumericIds({ appealId, lpaQuestionnaireId });
	return apiClient.patch(`appeals/${ids.appealId}/lpa-questionnaires/${ids.lpaQuestionnaireId}`, {
		json: {
			isAonbNationalLandscape: formattedValue
		}
	});
}
