/** @typedef {import('pins-data-model/src/schemas.js').Representation} Representation */

/**
 * Fetch counts of appeal representations by type
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string|undefined} statusFilter
 * @returns {Promise<{ [key: string]: number }>}
 */
export const getRepresentationCounts = (apiClient, appealId, statusFilter = 'all') => {
	let url = `appeals/${appealId}/reps/count`;

	if (statusFilter && statusFilter !== 'all') {
		url += `?status=${encodeURIComponent(statusFilter)}`;
	}

	return apiClient.get(url).json();
};

/**
 * Fetch paginated appeal comments based on appeal ID and status.
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} type
 * @returns {Promise<Representation>}
 */
export const getSingularRepresentationByType = async (apiClient, appealId, type) => {
	let url = `appeals/${appealId}/reps?type=${type}`;

	const apiResponse = await apiClient.get(url).json();

	return apiResponse.items.find((/** @type {Representation} */ { origin }) => origin === 'lpa');
};
