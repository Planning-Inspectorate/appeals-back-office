import { assertValidNumericIds } from '#lib/validators/api-parameters.validator.js';
/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} appellantCaseId
 * @param {boolean} enforcementNotice
 * @returns {Promise<{}>}
 */
export function changeEnforcementNotice(apiClient, appealId, appellantCaseId, enforcementNotice) {
	const ids = assertValidNumericIds({ appealId, appellantCaseId });
	return apiClient.patch(`appeals/${ids.appealId}/appellant-cases/${ids.appellantCaseId}`, {
		json: {
			enforcementNotice
		}
	});
}
