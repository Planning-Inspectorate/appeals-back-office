import { COMMENT_STATUS } from '@pins/appeals/constants/common.js';

/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} commentId
 * @param {string} redactedRepresentation
 * @param {boolean} [siteVisitRequested]
 * */
export const redactAndRejectComment = (
	apiClient,
	appealId,
	commentId,
	redactedRepresentation,
	siteVisitRequested
) =>
	apiClient
		.patch(`appeals/${appealId}/reps/${commentId}`, {
			json: {
				redactedRepresentation,
				siteVisitRequested,
				status: COMMENT_STATUS.VALID
			}
		})
		.json();
