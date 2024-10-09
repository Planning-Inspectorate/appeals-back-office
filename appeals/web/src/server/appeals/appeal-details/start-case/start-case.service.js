/** @typedef {import('#appeals/appeal-details/appeal-details.types').WebAppeal} Appeal */

/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} dateISOString
 * @returns {Promise<Appeal>}
 */
export async function setStartDate(apiClient, appealId, dateISOString) {
	return await apiClient
		.post(`appeals/${appealId}/appeal-timetables`, {
			json: { startDate: dateISOString }
		})
		.json();
}
