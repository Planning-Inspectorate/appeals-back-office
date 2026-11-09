import { assertValidNumericIds } from '#lib/validators/api-parameters.validator.js';

/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @returns {Promise<{}>}
 */
export function updateLPACostsAppliedFor(apiClient, appealId) {
	const ids = assertValidNumericIds({ appealId });
	return apiClient.patch(`appeals/${ids.appealId}/lpa-questionnaires/lpa-costs-application`);
}
