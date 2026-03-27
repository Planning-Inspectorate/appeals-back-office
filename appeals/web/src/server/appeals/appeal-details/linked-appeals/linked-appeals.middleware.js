/** @type {import('express').RequestHandler} */
export function initialiseLinkedAppealsSession(request, _, next) {
	request.session.linkableAppeal ??= {};
	delete request.session.leadAppeal;
	return next();
}

/** @type {import('express').RequestHandler} */
export function checkAppealIsLinked(request, response, next) {
	if (!request.currentAppeal.isParentAppeal) {
		return response.redirect(`/appeals-service/appeal-details/${request.currentAppeal.appealId}`);
	}
	return next();
}
