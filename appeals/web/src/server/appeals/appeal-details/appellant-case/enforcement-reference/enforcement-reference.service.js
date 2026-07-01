import { assertValidNumericIds } from '#lib/validators/api-parameters.validator.js';
/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} appellantCaseId
 * @param {string} enforcementReference
 * @returns {Promise<{}>}
 */
export function changeEnforcementReference(
	apiClient,
	appealId,
	appellantCaseId,
	enforcementReference
) {
	const ids = assertValidNumericIds({ appealId, appellantCaseId });
	return apiClient.patch(`appeals/${ids.appealId}/appellant-cases/${ids.appellantCaseId}`, {
		json: {
			enforcementReference
		}
	});
}
