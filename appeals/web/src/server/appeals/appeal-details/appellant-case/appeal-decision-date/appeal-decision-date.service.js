import { assertValidNumericIds } from '#lib/validators/api-parameters.validator.js';
/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} appellantCaseId
 * @param {string} appealDecisionDate
 * @returns {Promise<{}>}
 */
export function ChangeAppealDecisionDate(apiClient, appealId, appellantCaseId, appealDecisionDate) {
	const ids = assertValidNumericIds({ appealId, appellantCaseId });
	return apiClient.patch(`appeals/${ids.appealId}/appellant-cases/${ids.appellantCaseId}`, {
		json: {
			appealDecisionDate
		}
	});
}
