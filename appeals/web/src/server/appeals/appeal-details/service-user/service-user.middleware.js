/**
 * @type {import("express").RequestHandler}
 */
export function validateAction(request, response, next) {
	const { action } = request.params;
	if (!['add', 'change'].includes(action)) {
		return response.status(404).render('app/404.njk');
	}
	next();
}
