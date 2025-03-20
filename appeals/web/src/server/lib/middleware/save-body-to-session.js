/**
 * @param {string} key
 * @param {{ scopeToAppeal?: boolean }} [options]
 * @returns {import('@pins/express').RequestHandler<{}>}
 */
export const saveBodyToSession = (key, options) => (request, _, next) => {
	const { appealId } = request.params;

	if (!request.session[key]) {
		request.session[key] = {};
	}

	if (options?.scopeToAppeal) {
		request.session[key][appealId] = {
			...request.session[key][appealId],
			...request.body
		};
	} else {
		request.session[key] = {
			...request.session[key],
			...request.body
		};
	}

	next();
};
