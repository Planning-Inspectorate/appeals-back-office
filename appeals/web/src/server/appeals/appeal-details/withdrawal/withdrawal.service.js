import { assertValidNumericIds } from '#lib/validators/api-parameters.validator.js';
/**
 * @typedef {import('../appeal-details.types.js').WebAppeal} WebAppeal
 */

/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} withdrawalRequestDate
 * @returns {Promise<WebAppeal>}
 */
export async function postWithdrawalRequest(apiClient, appealId, withdrawalRequestDate) {
	const ids = assertValidNumericIds({ appealId });
	return await apiClient
		.post(`appeals/${ids.appealId}/withdrawal`, {
			json: { withdrawalRequestDate }
		})
		.json();
}
