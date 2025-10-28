/**
 * @type {import('express').RequestHandler}
 * @returns {void}
 */
export const clearSessionData = (req, res, next) => {
	if (!req.session) {
		return next();
	}

	// clears all session data except for account, permissions, and cookies
	const requiredSessionParams = new Set(['account', 'permissions', 'cookie']);

	Object.keys(req.session).forEach((key) => {
		if (!requiredSessionParams.has(key)) delete req.session[key];
	});

	next();
};
