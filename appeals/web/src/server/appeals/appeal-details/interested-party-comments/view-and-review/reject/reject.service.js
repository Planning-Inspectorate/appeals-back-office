import { COMMENT_STATUS } from '@pins/appeals/constants/common.js';

/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} commentId
 * @param {boolean} allowResubmit
 * @param {boolean} [siteVisitRequested]
 * */
export const rejectInterestedPartyComment = (
	apiClient,
	appealId,
	commentId,
	allowResubmit,
	siteVisitRequested
) =>
	apiClient
		.patch(`appeals/${appealId}/reps/${commentId}`, {
			json: {
				status: COMMENT_STATUS.INVALID,
				allowResubmit,
				siteVisitRequested
			}
		})
		.json();
