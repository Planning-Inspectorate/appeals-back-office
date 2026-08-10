import { assertValidNumericIds } from '#lib/validators/api-parameters.validator.js';
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
) => {
	const ids = assertValidNumericIds({ appealId, commentId });
	return apiClient
		.patch(`appeals/${ids.appealId}/reps/${ids.commentId}`, {
			json: {
				redactedRepresentation,
				status: COMMENT_STATUS.VALID,
				...(siteVisitRequested && {
					siteVisitRequested
				})
			}
		})
		.json();
};
