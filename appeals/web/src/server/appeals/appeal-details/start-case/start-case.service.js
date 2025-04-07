/** @typedef {import('#appeals/appeal-details/appeal-details.types').WebAppeal} Appeal */

/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} dateISOString
 * @param {string} [procedureType]
 * @returns {Promise<Appeal>}
 */
export async function setStartDate(apiClient, appealId, dateISOString, procedureType) {
	return await apiClient
		.post(`appeals/${appealId}/appeal-timetables`, {
			json: {
				startDate: dateISOString,
				...(procedureType && { procedureType })
			}
		})
		.json();
}
