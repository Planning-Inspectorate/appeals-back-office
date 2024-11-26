/** @type {import("express").Handler} */
export const redirectIfCommentIsReviewed = ({ currentAppeal, currentComment }, response, next) => {
	if (currentComment.status !== 'awaiting_review') {
		return response.redirect(
			`/appeals-service/appeal-details/${currentAppeal.appealId}/interested-party-comments/${currentComment.id}/view`
		);
	}
	next();
};

/** @type {import("express").Handler} */
export const redirectIfCommentIsUnreviewed = (
	{ currentAppeal, currentComment },
	response,
	next
) => {
	if (currentComment.status === 'awaiting_review') {
		return response.redirect(
			`/appeals-service/appeal-details/${currentAppeal.appealId}/interested-party-comments/${currentComment.id}/review`
		);
	}
	next();
};
