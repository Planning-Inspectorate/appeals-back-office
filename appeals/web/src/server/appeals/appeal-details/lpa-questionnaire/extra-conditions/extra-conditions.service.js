import { convertFromYesNoToBoolean } from '#lib/boolean-formatter.js';
import { assertValidNumericIds } from '#lib/validators/api-parameters.validator.js';

/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} lpaQuestionnaireId
 * @param {{radio: string, details: string}} updatedExtraConditions
 * @returns {Promise<{}>}
 */
export function changeExtraConditions(
	apiClient,
	appealId,
	lpaQuestionnaireId,
	updatedExtraConditions
) {
	let extraConditionsDetails;
	extraConditionsDetails = updatedExtraConditions.details;

	if (!convertFromYesNoToBoolean(updatedExtraConditions.radio)) {
		extraConditionsDetails = null;
	}

	const ids = assertValidNumericIds({ appealId, lpaQuestionnaireId });
	return apiClient.patch(`appeals/${ids.appealId}/lpa-questionnaires/${ids.lpaQuestionnaireId}`, {
		json: {
			extraConditions: extraConditionsDetails
		}
	});
}
