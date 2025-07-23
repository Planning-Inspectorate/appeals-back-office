/**
 * @param {string} sessionKey
 * @param {{ scopeToAppeal?: boolean }} [options]
 * @returns {import('@pins/express').RequestHandler<{}>}
 */
export const saveBodyToSession = (sessionKey, options) => (request, _, next) => {
	const { body, params, query, session } = request;
	const { appealId } = params;
	const editEntrypoint = query.editEntrypoint;
	const key = editEntrypoint ? `${sessionKey}/edit` : sessionKey;

	if (!session[key]) {
		session[key] = {};
	}

	if (options?.scopeToAppeal) {
		session[key][appealId] = {
			...session[key][appealId],
			...body
		};
	} else {
		session[key] = {
			...session[key],
			...body
		};
	}

	next();
};
