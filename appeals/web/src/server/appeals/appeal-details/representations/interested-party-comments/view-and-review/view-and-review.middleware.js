import { getInterestedPartyComment } from '#appeals/appeal-details/representations/interested-party-comments/interested-party-comments.service.js';

/** @type {import("express").Handler} */
export const assureCurrentRepresentation = async (req, res, next) => {
	const { appealId, commentId } = req.params;
	if (req.currentRepresentation?.id !== parseInt(commentId)) {
		req.currentRepresentation = await getInterestedPartyComment(req.apiClient, appealId, commentId);
	}
	next();
};

/** @type {import("express").Handler} */
export const redirectIfCommentIsReviewed = (
	{ currentAppeal, currentRepresentation },
	response,
	next
) => {
	if (currentRepresentation.status !== 'awaiting_review') {
		return response.redirect(
			`/appeals-service/appeal-details/${currentAppeal.appealId}/interested-party-comments/${currentRepresentation.id}/view`
		);
	}
	next();
};

/** @type {import("express").Handler} */
export const redirectIfCommentIsUnreviewed = (
	{ currentAppeal, currentRepresentation },
	response,
	next
) => {
	if (currentRepresentation.status === 'awaiting_review') {
		return response.redirect(
			`/appeals-service/appeal-details/${currentAppeal.appealId}/interested-party-comments/${currentRepresentation.id}/review`
		);
	}
	next();
};
