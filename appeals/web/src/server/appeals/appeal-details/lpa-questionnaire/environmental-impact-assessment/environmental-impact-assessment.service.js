import { convertFromYesNoToBoolean } from '#lib/boolean-formatter.js';

/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} lpaQuestionnaireId
 * @param {string} updatedData
 * @returns {Promise<{}>}
 */
export function changeEiaColumnTwoThreshold(apiClient, appealId, lpaQuestionnaireId, updatedData) {
	return apiClient.patch(`appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`, {
		json: {
			eiaColumnTwoThreshold: convertFromYesNoToBoolean(updatedData)
		}
	});
}

/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} lpaQuestionnaireId
 * @param {string} updatedData
 * @returns {Promise<{}>}
 */
export function changeEiaRequiresEnvironmentalStatement(
	apiClient,
	appealId,
	lpaQuestionnaireId,
	updatedData
) {
	return apiClient.patch(`appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`, {
		json: {
			eiaRequiresEnvironmentalStatement: convertFromYesNoToBoolean(updatedData)
		}
	});
}
