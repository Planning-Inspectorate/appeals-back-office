/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} commentId
 * @param {string} status
 * @param {boolean} [siteVisitRequest]
 * */
export const patchInterestedPartyCommentStatus = (
	apiClient,
	appealId,
	commentId,
	status,
	siteVisitRequest
) =>
	apiClient
		.patch(`appeals/${appealId}/reps/${commentId}`, {
			json: { status, siteVisitRequest }
		})
		.json();
