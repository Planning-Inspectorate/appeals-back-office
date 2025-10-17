import config from '#environment/config.js';
import { intersection } from 'lodash-es';
import * as authSession from './auth/auth-session.service.js';

/** @typedef {import('./auth/auth.service').AccountInfo} AccountInfo */

/**
 * @typedef {object} ViewHomepageRenderOptions
 * @property {typeof config['referenceData']} referenceData
 * @property {string[]} appealGroupIds
 */

/**
 * Display a homepage tailored to the user's group memberships.
 *
 * @type {import('@pins/express').RenderHandler<ViewHomepageRenderOptions>}
 */
export const viewHomepage = async (request, response) => {
	const account = /** @type {AccountInfo} */ (authSession.getAccount(request.session));
	const userGroups = account?.idTokenClaims?.groups ?? [];
	const appealGroupIds = intersection(Object.values(config.referenceData.appeals), userGroups);

	if (appealGroupIds.length === 0) {
		return response.status(403).render('app/403.njk');
	}

	return response.redirect('/appeals-service/personal-list');
};

/** @type {import('express').RequestHandler} */
export function handleHeadHealthCheck(_, response) {
	// no-op - HEAD mustn't return a body
	response.sendStatus(200);
	return;
}

/** @type {import('express').RequestHandler} */
export function handleHeathCheck(_, response) {
	response.status(200).send({
		status: 'OK',
		uptime: process.uptime(),
		commit: config.gitSha
	});
	return;
}

/** @type {import('express').RequestHandler} */
export function viewUnauthenticatedError(_, response) {
	response.status(401).render('app/401.njk');
	return;
}
