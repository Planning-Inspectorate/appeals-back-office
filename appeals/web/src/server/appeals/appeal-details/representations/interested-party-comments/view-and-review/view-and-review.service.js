import { assertValidNumericIds } from '#lib/validators/api-parameters.validator.js';

/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} commentId
 * @param {string} status
 * @param {boolean} [siteVisitRequested]
 * */
export const patchInterestedPartyCommentStatus = (
	apiClient,
	appealId,
	commentId,
	status,
	siteVisitRequested
) => {
	const ids = assertValidNumericIds({ appealId, commentId });
	return apiClient
		.patch(`appeals/${ids.appealId}/reps/${ids.commentId}`, {
			json: { status, siteVisitRequested }
		})
		.json();
};
