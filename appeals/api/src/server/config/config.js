import { loadEnvironment } from '@pins/platform';
import url from 'node:url';
import schema from './schema.js';
import path from 'node:path';

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
		featureFlagLinkedAppeals:
			environment.FEATURE_FLAG_LINKED_APPEALS && environment.FEATURE_FLAG_LINKED_APPEALS === 'true'
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
			},
			siteVisitChange: {
				accompaniedDateChange: {
					appellant: {
						id:
							environment.GOV_NOTIFY_SITE_VISIT_CHANGE_ACCOMPANIED_DATE_CHANGE_APPELLANT_ID ||
							'mock-site-visit-change-accompanied-date-change-appellant-id'
					},
					lpa: {
						id:
							environment.GOV_NOTIFY_SITE_VISIT_CHANGE_ACCOMPANIED_DATE_CHANGE_LPA_ID ||
							'mock-site-visit-change-accompanied-date-change-lpa-id'
					}
				},
				accompaniedToAccessRequired: {
					appellant: {
						id:
							environment.GOV_NOTIFY_SITE_VISIT_CHANGE_ACCOMPANIED_TO_ACCESS_REQUIRED_APPELLANT_ID ||
							'mock-site-visit-change-accompanied-to-access-required-appellant-id'
					},
					lpa: {
						id:
							environment.GOV_NOTIFY_SITE_VISIT_CHANGE_ACCOMPANIED_TO_ACCESS_REQUIRED_LPA_ID ||
							'mock-site-visit-change-accompanied-to-access-required-lpa-id'
					}
				},
				accompaniedToUnaccompanied: {
					appellant: {
						id:
							environment.GOV_NOTIFY_SITE_VISIT_CHANGE_ACCOMPANIED_TO_UNACCOMPANIED_APPELLANT_ID ||
							'mock-site-visit-change-accompanied-to-unaccompanied-appellant-id'
					},
					lpa: {
						id:
							environment.GOV_NOTIFY_SITE_VISIT_CHANGE_ACCOMPANIED_TO_UNACCOMPANIED_LPA_ID ||
							'mock-site-visit-change-accompanied-to-unaccompanied-lpa-id'
					}
				},
				accessRequiredDateChange: {
					appellant: {
						id:
							environment.GOV_NOTIFY_SITE_VISIT_CHANGE_ACCESS_REQUIRED_DATE_CHANGE_APPELLANT_ID ||
							'mock-site-visit-change-access-required-date-change-appellant-id'
					}
				},
				accessRequiredToAccompanied: {
					appellant: {
						id:
							environment.GOV_NOTIFY_SITE_VISIT_CHANGE_ACCESS_REQUIRED_TO_ACCOMPANIED_APPELLANT_ID ||
							'mock-site-visit-change-access-required-to-accompanied-appellant-id'
					},
					lpa: {
						id:
							environment.GOV_NOTIFY_SITE_VISIT_CHANGE_ACCESS_REQUIRED_TO_ACCOMPANIED_LPA_ID ||
							'mock-site-visit-change-access-required-to-accompanied-lpa-id'
					}
				},
				accessRequiredToUnaccompanied: {
					appellant: {
						id:
							environment.GOV_NOTIFY_SITE_VISIT_CHANGE_ACCESS_REQUIRED_TO_UNACCOMPANIED_APPELLANT_ID ||
							'mock-site-visit-change-access-required-to-unaccompanied-appellant-id'
					}
				},
				unaccompaniedToAccessRequired: {
					appellant: {
						id:
							environment.GOV_NOTIFY_SITE_VISIT_CHANGE_UNACCOMPANIED_TO_ACCESS_REQUIRED_APPELLANT_ID ||
							'mock-site-visit-change-unaccompanied-to-access-required-appellant-id'
					}
				},
				unaccompaniedToAccompanied: {
					appellant: {
						id:
							environment.GOV_NOTIFY_SITE_VISIT_CHANGE_UNACCOMPANIED_TO_ACCOMPANIED_APPELLANT_ID ||
							'mock-site-visit-change-unaccompanied-to-accompanied-appellant-id'
					},
					lpa: {
						id:
							environment.GOV_NOTIFY_SITE_VISIT_CHANGE_UNACCOMPANIED_TO_ACCOMPANIED_LPA_ID ||
							'mock-site-visit-change-unaccompanied-to-accompanied-lpa-id'
					}
				}
			},
			siteVisitSchedule: {
				accompanied: {
					appellant: {
						id:
							environment.GOV_NOTIFY_SITE_VISIT_SCHEDULE_ACCOMPANIED_APPELLANT_ID ||
							'mock-site-visit-schedule-accompanied-appellant-id'
					},
					lpa: {
						id:
							environment.GOV_NOTIFY_SITE_VISIT_SCHEDULE_ACCOMPANIED_LPA_ID ||
							'mock-site-visit-schedule-accompanied-lpa-id'
					}
				},
				accessRequired: {
					appellant: {
						id:
							environment.GOV_NOTIFY_SITE_VISIT_SCHEDULE_ACCESS_REQUIRED_APPELLANT_ID ||
							'mock-site-visit-schedule-access-required-appellant-id'
					}
				},
				unaccompanied: {
					appellant: {
						id:
							environment.GOV_NOTIFY_SITE_VISIT_SCHEDULE_UNACCOMPANIED_APPELLANT_ID ||
							'mock-site-visit-schedule-unaccompanied-appellant-id'
					}
				}
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
	}
});

if (error) {
	throw new Error(`loadConfig validation error: ${error.message}`);
}

export default value;
