import { assertValidNumericIds } from '#lib/validators/api-parameters.validator.js';
/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} appellantCaseId
 * @param {boolean} updatedValue
 * @returns {Promise<{}>}
 */
export function changeLandownerPermission(apiClient, appealId, appellantCaseId, updatedValue) {
	const ids = assertValidNumericIds({ appealId, appellantCaseId });
	return apiClient.patch(`appeals/${ids.appealId}/appellant-cases/${ids.appellantCaseId}`, {
		json: {
			landownerPermission: updatedValue
		}
	});
}
