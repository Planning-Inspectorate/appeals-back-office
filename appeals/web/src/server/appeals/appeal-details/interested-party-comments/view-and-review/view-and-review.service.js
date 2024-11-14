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
