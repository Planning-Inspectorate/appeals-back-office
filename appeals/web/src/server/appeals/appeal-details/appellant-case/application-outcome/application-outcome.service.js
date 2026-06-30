import { assertValidNumericIds } from '#lib/validators/api-parameters.validator.js';
/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} appellantCaseId
 * @param {string | null} applicationOutcome
 * @returns {Promise<{}>}
 */
export function changeApplicationOutcome(apiClient, appealId, appellantCaseId, applicationOutcome) {
	const ids = assertValidNumericIds({ appealId, appellantCaseId });
	return apiClient.patch(`appeals/${ids.appealId}/appellant-cases/${ids.appellantCaseId}`, {
		json: {
			applicationDecision: applicationOutcome
		}
	});
}
