import { assertValidNumericIds } from '#lib/validators/api-parameters.validator.js';
/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} appellantCaseId
 * @param {string} enforcementIssueDate
 * @returns {Promise<{}>}
 */
export function changeEnforcementIssueDate(
	apiClient,
	appealId,
	appellantCaseId,
	enforcementIssueDate
) {
	const ids = assertValidNumericIds({ appealId, appellantCaseId });
	return apiClient.patch(`appeals/${ids.appealId}/appellant-cases/${ids.appellantCaseId}`, {
		json: {
			enforcementIssueDate
		}
	});
}
