import { loadEnvironment } from '@pins/platform';
import path from 'node:path';
import dirname from './lib/utils/dirname.js';

const apiDir = path.join(dirname(import.meta.url), '..'); // package root, where .env files live

const environment = loadEnvironment(process.env.NODE_ENV, apiDir);

function getBoolean(value) {
	return Boolean(value && value.toLowerCase() === 'true');
}

export default {
	gitSha: process.env.GIT_SHA ?? 'NO GIT SHA FOUND',
	auth: {
		authServerUrl: environment.AUTH_BASE_URL
	},
	logger: {
		level: environment.LOGGER_LEVEL || 'info',
		isExtensive: getBoolean(environment.EXTENSIVE_LOGGING)
	},
	server: {
		port: Number(environment.SERVER_PORT) || 3000,
		showErrors: getBoolean(environment.SERVER_SHOW_ERRORS),
		terminationGracePeriod:
			(Number(environment.SERVER_TERMINATION_GRACE_PERIOD_SECONDS) || 0) * 1000
	},
	development: {
		createHTMLFile: getBoolean(environment.CREATE_HTML_FILE)
	}
};
