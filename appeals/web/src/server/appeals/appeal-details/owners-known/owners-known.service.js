/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} appellantCaseId
 * @param {{radio: string | null}} updatedOwnersKnown
 * @returns {Promise<{}>}
 */
export function changeOwnersKnown(apiClient, appealId, appellantCaseId, updatedOwnersKnown) {
	return apiClient.patch(`appeals/${appealId}/appellant-cases/${appellantCaseId}`, {
		json: {
			knowsOtherOwners: updatedOwnersKnown.radio
		}
	});
}
