/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} updatedLpaReference
 * @returns {Promise<{}>}
 */
export function changeLpaReference(apiClient, appealId, updatedLpaReference) {
	return apiClient.patch(`appeals/${appealId}`, {
		json: {
			planningApplicationReference: updatedLpaReference
		}
	});
}
