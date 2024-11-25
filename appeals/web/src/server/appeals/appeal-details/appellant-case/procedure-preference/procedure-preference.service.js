/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} appellantCaseId
 * @param {string} updatedValue
 * @returns {Promise<{}>}
 */
export function changeProcedurePreference(apiClient, appealId, appellantCaseId, updatedValue) {
	return apiClient.patch(`appeals/${appealId}/appellant-cases/${appellantCaseId}`, {
		json: {
			appellantProcedurePreference: updatedValue
		}
	});
}

/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} appellantCaseId
 * @param {string} updatedValue
 * @returns {Promise<{}>}
 */
export function changeProcedurePreferenceDetails(
	apiClient,
	appealId,
	appellantCaseId,
	updatedValue
) {
	return apiClient.patch(`appeals/${appealId}/appellant-cases/${appellantCaseId}`, {
		json: {
			appellantProcedurePreferenceDetails: updatedValue
		}
	});
}

/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} appellantCaseId
 * @param {string} updatedValue
 * @returns {Promise<{}>}
 */
export function changeProcedurePreferenceDuration(
	apiClient,
	appealId,
	appellantCaseId,
	updatedValue
) {
	return apiClient.patch(`appeals/${appealId}/appellant-cases/${appellantCaseId}`, {
		json: {
			appellantProcedurePreferenceDuration: updatedValue
		}
	});
}

/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} appellantCaseId
 * @param {string} updatedValue
 * @returns {Promise<{}>}
 */
export function changeInquiryNumberOfWitnesses(apiClient, appealId, appellantCaseId, updatedValue) {
	return apiClient.patch(`appeals/${appealId}/appellant-cases/${appellantCaseId}`, {
		json: {
			appellantProcedurePreferenceWitnessCount: updatedValue
		}
	});
}
