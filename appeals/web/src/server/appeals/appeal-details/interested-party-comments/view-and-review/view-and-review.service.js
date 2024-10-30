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
 * @param {import('../interested-party-comments.types.js').RejectionReasonUpdateInput[]} rejectionReasons
 * */
export const updateRejectionReasons = (apiClient, appealId, commentId, rejectionReasons) =>
	apiClient
		.patch(`appeals/${appealId}/reps/${commentId}/rejection-reasons`, {
			json: {
				rejectionReasons: rejectionReasons
			}
		})
		.json();

/**
 * @param {import('got').Got} apiClient
 * @returns {Promise<import('@pins/appeals.api').Appeals.RepresentationRejectionReason[]>}
 */
export async function getRepresentationRejectionReasonOptions(apiClient) {
	return apiClient.get(`appeals/representation-rejection-reasons`).json();
}
