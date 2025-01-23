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
