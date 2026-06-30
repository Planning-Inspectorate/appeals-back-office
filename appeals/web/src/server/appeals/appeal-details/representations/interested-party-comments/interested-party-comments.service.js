import { paginationDefaultSettings } from '#appeals/appeal.constants.js';
import { assertValidNumericIds } from '#lib/validators/api-parameters.validator.js';

/** @typedef {import('#appeals/appeal-details/representations/types.js').Representation} IPComments */
/** @typedef {import('#appeals/appeal-details/representations/types.js').RepresentationList} IPCommentsList */

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
	const ids = assertValidNumericIds({ appealId });
	let url = `appeals/${ids.appealId}/reps?type=comment&pageNumber=${pageNumber}&pageSize=${pageSize}`;

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
export const getInterestedPartyComment = (apiClient, appealId, commentId) => {
	const ids = assertValidNumericIds({ appealId, commentId });
	return apiClient.get(`appeals/${ids.appealId}/reps/${ids.commentId}`).json();
};
