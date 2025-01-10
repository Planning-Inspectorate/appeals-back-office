import { COMMENT_STATUS } from '@pins/appeals/constants/common.js';

/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} commentId
 * @param {boolean} allowResubmit
 * */
export const rejectInterestedPartyComment = (apiClient, appealId, commentId, allowResubmit) =>
	apiClient
		.patch(`appeals/${appealId}/reps/${commentId}`, {
			json: {
				status: COMMENT_STATUS.INVALID,
				allowResubmit
			}
		})
		.json();
