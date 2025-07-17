/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {number} relationshipId
 * @returns {Promise<{}>}
 */
export function postUnlinkRequest(apiClient, appealId, relationshipId) {
	return apiClient
		.delete(`appeals/${appealId}/unlink-appeal`, {
			json: { relationshipId }
		})
		.json();
}
