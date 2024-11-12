/**
 * @param {string} key
 * @returns {import('@pins/express').RequestHandler<{}>}
 */
export const saveBodyToSession = (key) => (request, _, next) => {
	request.session[key] = { ...(request.session[key] || {}), ...request.body };

	next();
};
