/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} commentsId
 * @param {string} status
 * */
export const patchFinalCommentsStatus = (apiClient, appealId, commentsId, status) =>
	apiClient
		.patch(`appeals/${appealId}/reps/${commentsId}/status`, {
			json: {
				status
			}
		})
		.json();
