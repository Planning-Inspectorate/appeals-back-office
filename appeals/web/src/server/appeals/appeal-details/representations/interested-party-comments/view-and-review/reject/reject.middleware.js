/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {() => any} next
 * */
export async function initialiseSession(request, response, next) {
	const { rejectIpComment } = request.session;
	const commentId = parseInt(request.params.commentId);

	if (!rejectIpComment || rejectIpComment.commentId !== commentId) {
		request.session.rejectIpComment = { commentId };
	}

	next();
}
