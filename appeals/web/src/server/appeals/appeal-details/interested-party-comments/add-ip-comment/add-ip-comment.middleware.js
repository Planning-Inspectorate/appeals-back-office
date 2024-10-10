/**
 * @type {import('express').RequestHandler}
 * */
export async function saveBodyToSession(request, response, next) {
	request.session.addIpComment = { ...request.session.addIpComment, ...request.body };

	next();
}
