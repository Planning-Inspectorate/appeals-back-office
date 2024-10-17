import { paginationDefaultSettings } from '#appeals/appeal.constants.js';

/** @typedef {import('#appeals/appeal-details/interested-party-comments/interested-party-comments.types').Representation} IPComments */
/** @typedef {import('#appeals/appeal-details/interested-party-comments/interested-party-comments.types').RepresentationList} IPCommentsList */

/**
 * Fetch paginated appeal comments based on appeal ID and status.
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string|undefined} statusFilter
 * @param {number} pageNumber
 * @param {number} pageSize
 * @returns {Promise<IPCommentsList>}
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

/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} commentId
 * */
export const getInterestedPartyComment = (apiClient, appealId, commentId) =>
	apiClient.get(`appeals/${appealId}/reps/${commentId}`).json();

/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} commentId
 * @param {string} status
 * */
export const patchInterestedPartyCommentStatus = (apiClient, appealId, commentId, status) =>
	apiClient
		.patch(`appeals/${appealId}/reps/${commentId}/status`, {
			json: {
				status
			}
		})
		.json();
