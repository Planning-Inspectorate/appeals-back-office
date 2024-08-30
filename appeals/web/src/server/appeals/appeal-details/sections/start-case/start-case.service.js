/** @typedef {import('#appeals/appeal-details/appeal-details.types').WebAppeal} Appeal */

/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} todayApiDateString
 * @returns {Promise<Appeal>}
 */
export async function setStartDate(apiClient, appealId, todayApiDateString) {
	return await apiClient
		.post(`appeals/${appealId}/appeal-timetables`, {
			json: { startDate: todayApiDateString }
		})
		.json();
}
