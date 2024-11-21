/** @type {import("express").Handler} */
export const redirectIfCommentIsReviewed = (
	{ currentAppeal, currentComment },
	{ redirect },
	next
) => {
	if (currentComment.status !== 'awaiting_review') {
		redirect(
			`/appeals-service/appeal-details/${currentAppeal.appealId}/interested-party-comments/${currentComment.id}/view`
		);
	}
	next();
};
