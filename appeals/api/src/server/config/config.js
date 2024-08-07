import { loadEnvironment } from '@pins/platform';
import url from 'node:url';
import schema from './schema.js';
import path from 'node:path';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const apiDir = path.join(__dirname, '..', '..', '..'); // api package root, where .env files live

const environment = loadEnvironment(process.env.NODE_ENV, apiDir);

const { value, error } = schema.validate({
	NODE_ENV: environment.NODE_ENV,
	PORT: environment.PORT,
	SWAGGER_JSON_DIR: environment.SWAGGER_JSON_DIR || './src/server/openapi.json',
	APPLICATIONINSIGHTS_CONNECTION_STRING: environment.APPLICATIONINSIGHTS_CONNECTION_STRING,
	DATABASE_URL: environment.DATABASE_URL,
	BO_BLOB_STORAGE_ACCOUNT: environment.BO_BLOB_STORAGE_ACCOUNT,
	BO_BLOB_CONTAINER: environment.BO_BLOB_CONTAINER,
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
	// flag name convention: featureFlag[ jira number ][ferature shoret description]
	// set Feature Flag default val here [default: false] - will be overwritted by values cming from the .env file
	featureFlags: {
		featureFlagBoas1TestFeature: !environment.FEATURE_FLAG_BOAS_1_TEST_FEATURE
			? false
			: environment.FEATURE_FLAG_BOAS_1_TEST_FEATURE === 'true',
		featureFlagS78Written: environment.FEATURE_FLAG_S78_WRITTEN === 'false'
	},
	serviceBusEnabled: environment.SERVICE_BUS_ENABLED && environment.SERVICE_BUS_ENABLED === 'true',
	govNotify: {
		api: {
			key: environment.GOV_NOTIFY_API_KEY
		},
		template: {
			appealConfirmed: {
				id: environment.GOV_NOTIFY_APPEAL_CONFIRMED_ID || 'mock-appeal-confirmed-id'
			},
			appealIncomplete: {
				id: environment.GOV_NOTIFY_APPEAL_INCOMPLETE_ID || 'mock-appeal-incomplete-id'
			},
			appealInvalid: {
				id: environment.GOV_NOTIFY_APPEAL_INVALID_ID || 'mock-appeal-invalid-id'
			},
			appealWithdrawn: {
				appellant: {
					id:
						environment.GOV_NOTIFY_APPEAL_WITHDRAWN_APPELLANT_ID ||
						'mock-appeal-withdrawn-appellant-id'
				},
				lpa: {
					id: environment.GOV_NOTIFY_APPEAL_WITHDRAWN_LPA_ID || 'mock-appeal-withdrawn-lpa-id'
				}
			},
			appealStartDateChange: {
				appellant: {
					id:
						environment.GOV_NOTIFY_APPEAL_START_DATE_CHANGE_APPELLANT_ID ||
						'mock-appeal-start-date-change-appellant-id'
				},
				lpa: {
					id:
						environment.GOV_NOTIFY_APPEAL_START_DATE_CHANGE_LPA_ID ||
						'mock-appeal-start-date-change-lpa-id'
				}
			},
			appealTypeChangedNonHas: {
				id:
					environment.GOV_NOTIFY_APPEAL_TYPE_CHANGED_NON_HAS_ID ||
					'mock-appeal-type-changed-non-has-id'
			},
			appealValidStartCase: {
				appellant: {
					id:
						environment.GOV_NOTIFY_APPEAL_VALID_START_CASE_APPELLANT_ID ||
						'mock-appeal-valid-start-case-appellant-id'
				},
				lpa: {
					id:
						environment.GOV_NOTIFY_APPEAL_VALID_START_CASE_LPA_ID ||
						'mock-appeal-valid-start-case-lpa-id'
				}
			},
			decisionIsAllowedSplitDismissed: {
				appellant: {
					id:
						environment.GOV_NOTIFY_DECISION_IS_ALLOWED_SPLIT_DISMISSED_APPELLANT_ID ||
						'mock-decision-is-allowed-split-dismissed-appellant-id'
				},
				lpa: {
					id:
						environment.GOV_NOTIFY_DECISION_IS_ALLOWED_SPLIT_DISMISSED_LPA_ID ||
						'mock-decision-is-allowed-split-dismissed-lpa-id'
				}
			},
			decisionIsInvalidAppellant: {
				id:
					environment.GOV_NOTIFY_DECISION_IS_INVALID_APPELLANT_ID ||
					'mock-decision-is-invalid-appellant-id'
			},
			decisionIsInvalidLPA: {
				id: environment.GOV_NOTIFY_DECISION_IS_INVALID_LPA_ID || 'mock-decision-is-invalid-lpa-id'
			},
			lpaqComplete: {
				id: environment.GOV_NOTIFY_LPAQ_COMPLETE_ID || 'mock-lpaq-complete-id'
			},
			lpaqIncomplete: {
				id: environment.GOV_NOTIFY_LPAQ_INCOMPLETE_ID || 'mock-lpaq-incomplete-id'
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
			},
			validAppellantCase: {
				id: environment.GOV_NOTIFY_VALID_APPELLANT_CASE_ID || 'mock-valid-appellant-case-id'
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
