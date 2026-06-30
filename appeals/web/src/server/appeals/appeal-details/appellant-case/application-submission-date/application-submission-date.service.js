import { assertValidNumericIds } from '#lib/validators/api-parameters.validator.js';
/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} appellantCaseId
 * @param {string} updatedDate
 * @returns {Promise<{}>}
 */
export function changeApplicationSubmissionDate(apiClient, appealId, appellantCaseId, updatedDate) {
	const ids = assertValidNumericIds({ appealId, appellantCaseId });
	return apiClient.patch(`appeals/${ids.appealId}/appellant-cases/${ids.appellantCaseId}`, {
		json: {
			applicationDate: updatedDate
		}
	});
}
