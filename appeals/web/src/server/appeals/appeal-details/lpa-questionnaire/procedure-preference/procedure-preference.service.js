import { assertValidNumericIds } from '#lib/validators/api-parameters.validator.js';
/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} lpaQuestionnaireId
 * @param {string} updatedValue
 * @returns {Promise<{}>}
 */
export function changeProcedurePreference(apiClient, appealId, lpaQuestionnaireId, updatedValue) {
	const ids = assertValidNumericIds({ appealId, lpaQuestionnaireId });
	return apiClient.patch(`appeals/${ids.appealId}/lpa-questionnaires/${ids.lpaQuestionnaireId}`, {
		json: {
			lpaProcedurePreference: updatedValue
		}
	});
}

/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} lpaQuestionnaireId
 * @param {string} updatedValue
 * @returns {Promise<{}>}
 */
export function changeProcedurePreferenceDetails(
	apiClient,
	appealId,
	lpaQuestionnaireId,
	updatedValue
) {
	const ids = assertValidNumericIds({ appealId, lpaQuestionnaireId });
	return apiClient.patch(`appeals/${ids.appealId}/lpa-questionnaires/${ids.lpaQuestionnaireId}`, {
		json: {
			lpaProcedurePreferenceDetails: updatedValue
		}
	});
}

/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} lpaQuestionnaireId
 * @param {string} updatedValue
 * @returns {Promise<{}>}
 */
export function changeProcedurePreferenceDuration(
	apiClient,
	appealId,
	lpaQuestionnaireId,
	updatedValue
) {
	const ids = assertValidNumericIds({ appealId, lpaQuestionnaireId });
	return apiClient.patch(`appeals/${ids.appealId}/lpa-questionnaires/${ids.lpaQuestionnaireId}`, {
		json: {
			lpaProcedurePreferenceDuration: updatedValue
		}
	});
}
