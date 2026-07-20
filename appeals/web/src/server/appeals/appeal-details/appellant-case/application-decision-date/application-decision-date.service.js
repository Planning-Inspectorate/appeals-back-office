import { assertValidNumericIds } from '#lib/validators/api-parameters.validator.js';
/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} appellantCaseId
 * @param {string | null} updatedDate
 * @returns {Promise<{}>}
 */
export function changeApplicationDecisionDate(apiClient, appealId, appellantCaseId, updatedDate) {
	const ids = assertValidNumericIds({ appealId, appellantCaseId });
	return apiClient.patch(`appeals/${ids.appealId}/appellant-cases/${ids.appellantCaseId}`, {
		json: {
			applicationDecisionDate: updatedDate
		}
	});
}
