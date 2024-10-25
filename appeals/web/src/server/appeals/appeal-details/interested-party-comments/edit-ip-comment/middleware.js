/**
 * @type {import('express').RequestHandler}
 * */
export async function saveBodyToSession(request, response, next) {
	request.session.editIpComment = { ...request.session.editIpComment, ...request.body };

	next();
}
