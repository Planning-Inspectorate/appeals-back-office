/** @type {import('express').RequestHandler} */
export function initialiseLinkedAppealsSession(request, _, next) {
	request.session.linkableAppeal ??= {};
	next();
}
