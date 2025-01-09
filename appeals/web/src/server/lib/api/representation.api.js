/**
 * @param {import('got').Got} apiClient
 * @param {number} appealId
 * @param {number} repId
 * @param {string} redactedRepresentation
 * */
export const patchRepresentationRedaction = (apiClient, appealId, repId, redactedRepresentation) =>
	apiClient
		.patch(`appeals/${appealId}/reps/${repId}/redaction`, {
			json: { redactedRepresentation }
		})
		.json();
