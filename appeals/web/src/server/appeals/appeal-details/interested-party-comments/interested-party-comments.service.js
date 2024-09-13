import { paginationDefaultSettings } from '#appeals/appeal.constants.js';

/**
 * Fetch paginated appeal comments based on appeal ID and status.
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string|undefined} statusFilter
 * @param {number} pageNumber
 * @param {number} pageSize
 * @returns {Promise<any>}
 */
export const getInterestedPartyComments = (
	apiClient,
	appealId,
	statusFilter = 'all',
	pageNumber = paginationDefaultSettings.firstPageNumber,
	pageSize = paginationDefaultSettings.pageSize
) => {
	let url = `appeals/${appealId}/reps/comments?pageNumber=${pageNumber}&pageSize=${pageSize}`;

	if (statusFilter && statusFilter !== 'all') {
		url += `&status=${encodeURIComponent(statusFilter)}`;
	}

	return apiClient.get(url).json();
};
