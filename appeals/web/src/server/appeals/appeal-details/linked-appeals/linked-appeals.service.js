/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} [appealRefToReplaceLead]
 * @returns {Promise<{}>}
 */
export function postUnlinkRequest(apiClient, appealId, appealRefToReplaceLead) {
	const data = { operation: 'unlink' };

	if (appealRefToReplaceLead) {
		// @ts-ignore
		data.appealRefToReplaceLead = appealRefToReplaceLead;
	}

	return apiClient
		.post(`appeals/${Number(appealId)}/update-linked-appeals`, {
			json: data
		})
		.json();
}

/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {number} relationshipId
 * @returns {Promise<{}>}
 */
export function postUnrelateRequest(apiClient, appealId, relationshipId) {
	const appealIdNumber = parseInt(appealId, 10);
	return apiClient
		.delete(`appeals/${appealIdNumber}/unlink-appeal`, {
			json: { relationshipId }
		})
		.json();
}
