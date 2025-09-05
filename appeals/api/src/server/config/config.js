import { loadEnvironment } from '@pins/platform';
import path from 'node:path';
import url from 'node:url';
import schema from './schema.js';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const apiDir = path.join(__dirname, '..', '..', '..'); // api package root, where .env files live

const environment = loadEnvironment(process.env.NODE_ENV, apiDir);

const { value, error } = schema.validate({
	gitSha: process.env.GIT_SHA ?? 'NO GIT SHA FOUND',
	NODE_ENV: environment.NODE_ENV,
	PORT: environment.PORT,
	SWAGGER_JSON_DIR: environment.SWAGGER_JSON_DIR || './src/server/openapi.json',
	APPLICATIONINSIGHTS_CONNECTION_STRING: environment.APPLICATIONINSIGHTS_CONNECTION_STRING,
	DATABASE_URL: environment.DATABASE_URL,
	BO_BLOB_STORAGE_ACCOUNT: environment.BO_BLOB_STORAGE_ACCOUNT,
	BO_BLOB_CONTAINER: environment.BO_BLOB_CONTAINER,
	blobEmulatorSasUrl: environment.AZURE_BLOB_EMULATOR_SAS_HOST,
	useBlobEmulator: environment.AZURE_BLOB_USE_EMULATOR || false,
	useNotifyEmulator: environment.NOTIFY_SEND_MAIL_EMULATOR || false,
	defaultApiVersion: environment.DEFAULT_API_VERSION || '1',
	serviceBusOptions: {
		hostname: environment.SERVICE_BUS_HOSTNAME
	},
	msal: {
		clientId: environment.AUTH_CLIENT_BACKEND_API_ID,
		tenantId: environment.AUTH_TENANT_ID
	},
	log: {
		levelStdOut: environment.LOG_LEVEL_STDOUT || 'debug'
	},
	cwd: url.fileURLToPath(new URL('..', import.meta.url)),
	featureFlags: {
		featureFlagS78Written:
			environment.FEATURE_FLAG_S78_WRITTEN && environment.FEATURE_FLAG_S78_WRITTEN === 'true',
		featureFlagS78Hearing:
			environment.FEATURE_FLAG_S78_HEARING && environment.FEATURE_FLAG_S78_HEARING === 'true',
		featureFlagS78Inquiry:
			environment.FEATURE_FLAG_S78_INQUIRY && environment.FEATURE_FLAG_S78_INQUIRY === 'true',
		featureFlagLinkedAppeals:
			environment.FEATURE_FLAG_LINKED_APPEALS && environment.FEATURE_FLAG_LINKED_APPEALS === 'true',
		featureFlagS20: environment.FEATURE_FLAG_S20 && environment.FEATURE_FLAG_S20 === 'true',
		featureFlagCAS: environment.FEATURE_FLAG_CAS && environment.FEATURE_FLAG_CAS === 'true',
		featureFlagCasAdvert:
			environment.FEATURE_FLAG_CAS_ADVERT && environment.FEATURE_FLAG_CAS_ADVERT === 'true',
		featureFlagNetResidence:
			environment.FEATURE_FLAG_NET_RESIDENCE && environment.FEATURE_FLAG_NET_RESIDENCE === 'true',
		featureFlagAdvertisement:
			environment.FEATURE_FLAG_ADVERTISEMENT && environment.FEATURE_FLAG_ADVERTISEMENT === 'true',
		featureFlagChangeAppealType:
			environment.FEATURE_FLAG_CHANGE_APPEAL_TYPE &&
			environment.FEATURE_FLAG_CHANGE_APPEAL_TYPE === 'true'
	},
	serviceBusEnabled: environment.SERVICE_BUS_ENABLED && environment.SERVICE_BUS_ENABLED === 'true',
	enableTestEndpoints:
		environment.ENABLE_TEST_ENDPOINTS && environment.ENABLE_TEST_ENDPOINTS === 'true',
	govNotify: {
		api: {
			key: environment.GOV_NOTIFY_API_KEY
		},
		template: {
			generic: {
				id: environment.GOV_NOTIFY_APPEAL_GENERIC_ID || 'mock-appeal-generic-id'
			}
		},
		testMailbox: environment.TEST_MAILBOX || 'test@example.com'
	},
	appealAllocationLevels: [
		{ level: 'A', band: 3 },
		{ level: 'B', band: 3 },
		{ level: 'C', band: 2 },
		{ level: 'D', band: 2 },
		{ level: 'E', band: 1 },
		{ level: 'F', band: 1 },
		{ level: 'G', band: 1 },
		{ level: 'H', band: 1 }
	],
	horizon: {
		url: environment.SRV_HORIZON_URL,
		mock: environment.MOCK_HORIZON,
		timeoutLimit: environment.TIMEOUT_LIMIT_HORIZON || 5000
	},
	frontOffice: {
		url: environment.FRONT_OFFICE_URL || '/mock-front-office-url'
	}
});

if (error) {
	throw new Error(`loadConfig validation error: ${error.message}`);
}

export default value;
