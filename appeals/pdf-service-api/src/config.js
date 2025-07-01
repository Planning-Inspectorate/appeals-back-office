import { loadEnvironment } from '@pins/platform';
import path from 'node:path';
import url from 'node:url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const apiDir = path.join(__dirname, '..'); // package root, where .env files live

const environment = loadEnvironment(process.env.NODE_ENV, apiDir);

export default {
	gitSha: process.env.GIT_SHA ?? 'NO GIT SHA FOUND',
	auth: {
		authServerUrl: environment.AUTH_BASE_URL
	},
	logger: {
		level: environment.LOGGER_LEVEL || 'info'
	},
	server: {
		port: Number(environment.SERVER_PORT) || 3000,
		showErrors: environment.SERVER_SHOW_ERRORS === 'true',
		terminationGracePeriod:
			(Number(environment.SERVER_TERMINATION_GRACE_PERIOD_SECONDS) || 0) * 1000
	}
};
