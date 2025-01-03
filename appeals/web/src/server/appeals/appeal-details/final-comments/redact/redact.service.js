/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} commentId
 * @param {string} redactedRepresentation
 * */
export const patchFinalCommentRedaction = (
	apiClient,
	appealId,
	commentId,
	redactedRepresentation
) =>
	apiClient
		.patch(`appeals/${appealId}/reps/${commentId}/redaction`, {
			json: {
				redactedRepresentation
			}
		})
		.json();
