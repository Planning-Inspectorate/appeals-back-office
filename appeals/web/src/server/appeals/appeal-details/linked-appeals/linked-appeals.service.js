/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {number} relationshipId
 * @returns {Promise<{}>}
 */
export function postUnlinkRequest(apiClient, appealId, relationshipId) {
	const appealIdNumber = parseInt(appealId, 10);
	return apiClient
		.delete(`appeals/${appealIdNumber}/unlink-appeal`, {
			json: { relationshipId }
		})
		.json();
}
