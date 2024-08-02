import { convertFromYesNoToBoolean } from '#lib/boolean-formatter.js';

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

	return apiClient.patch(`appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`, {
		json: {
			extraConditions: extraConditionsDetails
		}
	});
}
