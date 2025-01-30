import { COMMENT_STATUS } from '@pins/appeals/constants/common.js';

/**
 * @param {import('got').Got} apiClient
 * @param {string|number} appealId
 * @param {string|number} commentId
 * @param {string} redactedRepresentation
 * @param {boolean} [siteVisitRequested]
 * */
export const redactAndAcceptComment = (
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
				status: COMMENT_STATUS.VALID,
				...(siteVisitRequested && {
					siteVisitRequested
				})
			}
		})
		.json();
