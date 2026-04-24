import config from '@pins/appeals.web/environment/config.js';
import { createHttpLoggerHooks, createHttpRetryParams } from '@pins/platform';
import got from 'got';
import * as authSession from '../../app/auth/auth-session.service.js';
import pino from '../logger.js';

const instance = got.extend({
	prefixUrl: config.apiUrl,
	responseType: 'json',
	resolveBodyOnly: true
});

/** @type {import('got').BeforeRequestHook} */
let requestLogger;
/** @type {import('got').AfterResponseHook<any>} */
let responseLogger;
/** @type {import('got').BeforeRetryHook} */
let retryLogger;

if (!config.isTest) {
	[requestLogger, responseLogger, retryLogger] = createHttpLoggerHooks(pino, config.logLevelStdOut);
}
const retryParams = createHttpRetryParams(config.retry);

const getInstance = (/** @type {string} */ userId) => {
	if (config.isTest) {
		return instance;
	}
	return instance.extend({
		retry: retryParams,
		hooks: {
			beforeRetry: [retryLogger],
			beforeRequest: [
				requestLogger,
				async (options) => {
					options.headers.azureAdUserId = userId;
				}
			],
			afterResponse: [responseLogger]
		}
	});
};

/**
 * @type {import('express').RequestHandler}
 * @returns {Promise<object|void>}
 */
export const addApiClientToRequest = async (req, res, next) => {
	const user = authSession.getAccount(req.session);
	if (!user || !user.localAccountId) {
		pino.error(`Unauthenticated user should not get here...`);
		return res.status(500).send('Unauthenticated user');
	}

	pino.info(`Creating API client for user '${user.localAccountId}'`);
	req.apiClient = getInstance(user.localAccountId);
	next();
};
