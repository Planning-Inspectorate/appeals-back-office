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
