import { calculatePermissions } from '#environment/permissions.js';
import * as authSession from './auth-session.service.js';

/** @type {import('express').RequestHandler} */
export const registerAuthLocals = (req, res, next) => {
	const account = authSession.getAccount(req.session);
	const isAuthenticated = Boolean(account);
	if (isAuthenticated) {
		req.session.permissions = calculatePermissions(account?.idTokenClaims.groups || []);
	}
	res.locals.isAuthenticated = isAuthenticated;
	next();
	return;
};

/** @type {import('express').RequestHandler} */
export const clearAuthenticationData = ({ session }, _, next) => {
	authSession.destroyAuthenticationData(session);
	next();
	return;
};
