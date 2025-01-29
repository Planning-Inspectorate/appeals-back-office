/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} commentId
 * @param {string} status
 * @param {boolean} [siteVisitRequested]
 * */
export const patchInterestedPartyCommentStatus = (
	apiClient,
	appealId,
	commentId,
	status,
	siteVisitRequested
) =>
	apiClient
		.patch(`appeals/${appealId}/reps/${commentId}`, {
			json: { status, siteVisitRequested }
		})
		.json();
