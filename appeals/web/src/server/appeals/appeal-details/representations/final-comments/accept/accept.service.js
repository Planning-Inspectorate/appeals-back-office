/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} commentId
 * @param {string} status
 * */
export const patchFinalComment = (apiClient, appealId, commentId, status) =>
	apiClient
		.patch(`appeals/${appealId}/reps/${commentId}/status`, {
			json: {
				status,
				allowResubmit: true
			}
		})
		.json();
