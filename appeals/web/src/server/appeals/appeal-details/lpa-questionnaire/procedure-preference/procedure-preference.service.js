/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} lpaQuestionnaireId
 * @param {string} updatedValue
 * @returns {Promise<{}>}
 */
export function changeProcedurePreference(apiClient, appealId, lpaQuestionnaireId, updatedValue) {
	return apiClient.patch(`appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`, {
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
	return apiClient.patch(`appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`, {
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
	return apiClient.patch(`appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`, {
		json: {
			lpaProcedurePreferenceDuration: updatedValue
		}
	});
}
