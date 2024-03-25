/** @typedef {import('#appeals/appeal-details/appeal-details.types').WebAppeal} Appeal */

/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string|null} validAt
 * @returns {Promise<Appeal>}
 */
export async function setAppealValidDate(apiClient, appealId, validAt) {
	return await apiClient
		.patch(`appeals/${appealId}`, {
			json: { validAt: validAt }
		})
		.json();
}
