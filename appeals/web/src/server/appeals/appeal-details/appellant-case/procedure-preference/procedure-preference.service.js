import { assertValidNumericIds } from '#lib/validators/api-parameters.validator.js';
/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} appellantCaseId
 * @param {string} updatedValue
 * @returns {Promise<{}>}
 */
export function changeProcedurePreference(apiClient, appealId, appellantCaseId, updatedValue) {
	const ids = assertValidNumericIds({ appealId, appellantCaseId });
	return apiClient.patch(`appeals/${ids.appealId}/appellant-cases/${ids.appellantCaseId}`, {
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
	const ids = assertValidNumericIds({ appealId, appellantCaseId });
	return apiClient.patch(`appeals/${ids.appealId}/appellant-cases/${ids.appellantCaseId}`, {
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
	const ids = assertValidNumericIds({ appealId, appellantCaseId });
	return apiClient.patch(`appeals/${ids.appealId}/appellant-cases/${ids.appellantCaseId}`, {
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
	const ids = assertValidNumericIds({ appealId, appellantCaseId });
	return apiClient.patch(`appeals/${ids.appealId}/appellant-cases/${ids.appellantCaseId}`, {
		json: {
			appellantProcedurePreferenceWitnessCount: updatedValue
		}
	});
}
