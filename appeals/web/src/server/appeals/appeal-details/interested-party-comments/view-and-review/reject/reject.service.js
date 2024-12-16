import { COMMENT_STATUS } from '@pins/appeals/constants/common.js';

/**
 * @param {import('got').Got} apiClient
 * @returns {Promise<import('@pins/appeals.api').Appeals.RepresentationRejectionReason[]>}
 */
export async function getRepresentationRejectionReasonOptions(apiClient) {
	return apiClient.get(`appeals/representation-rejection-reasons`).json();
}

/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} commentId
 * @param {import('#appeals/appeal-details/representations/types.js').RejectionReasonUpdateInput[]} rejectionReasons
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
 * @param {string} appealId
 * @param {string} commentId
 * @param {boolean} allowResubmit
 * */
export const rejectInterestedPartyComment = (apiClient, appealId, commentId, allowResubmit) =>
	apiClient
		.patch(`appeals/${appealId}/reps/${commentId}/status`, {
			json: {
				status: COMMENT_STATUS.INVALID,
				allowResubmit
			}
		})
		.json();
