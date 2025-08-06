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
	return await apiClient
		.post(`appeals/${appealId}/withdrawal`, {
			json: { withdrawalRequestDate }
		})
		.json();
}
