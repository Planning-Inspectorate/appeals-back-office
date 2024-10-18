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

/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} commentId
 * */
export const getInterestedPartyComment = (apiClient, appealId, commentId) =>
	apiClient.get(`appeals/${appealId}/reps/${commentId}`).json();
