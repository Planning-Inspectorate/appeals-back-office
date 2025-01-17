import { COMMENT_STATUS } from '@pins/appeals/constants/common.js';

/**
 * @param {import('got').Got} apiClient
 * @param {string} finalCommentsType
 * @returns {Promise<import('@pins/appeals.api').Appeals.RepresentationRejectionReason[]>}
 */
export async function getRepresentationRejectionReasonOptions(apiClient, finalCommentsType) {
	return apiClient
		.get(`appeals/representation-rejection-reasons?type=${finalCommentsType}_final_comment`)
		.json();
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
 * @param {number} appealId
 * @param {number} commentId
 * @param {import('#appeals/appeal-details/representations/types.js').RejectionReasonUpdateInput[]} rejectionReasons
 * */
export const rejectFinalComment = (apiClient, appealId, commentId, rejectionReasons) =>
	apiClient.patch(`appeals/${appealId}/reps/${commentId}`, {
		json: {
			rejectionReasons,
			status: COMMENT_STATUS.INVALID
		}
	});
