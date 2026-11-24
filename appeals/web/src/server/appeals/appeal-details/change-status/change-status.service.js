/**
 * @param {import('got').Got} apiClient
 * @param {number} appealId
 * @param {string} status
 * @returns {Promise<any>}
 */
export const updateAppealStatus = (apiClient, appealId, status) => {
	return apiClient
		.patch(`appeals/${appealId}/appeal-status`, {
			json: { status }
		})
		.json();
};
