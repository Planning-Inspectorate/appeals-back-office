/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} commentId
 * @param {string} redactedRepresentation
 * */
export const patchInterestedPartyCommentRedaction = (
	apiClient,
	appealId,
	commentId,
	redactedRepresentation
) =>
	apiClient
		.patch(`appeals/${appealId}/reps/${commentId}`, {
			json: {
				redactedRepresentation,
				test: 'test'
			}
		})
		.json();
