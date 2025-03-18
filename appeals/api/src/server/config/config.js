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
			environment.FEATURE_FLAG_S78_WRITTEN && environment.FEATURE_FLAG_S78_WRITTEN === 'true'
	},
	serviceBusEnabled: environment.SERVICE_BUS_ENABLED && environment.SERVICE_BUS_ENABLED === 'true',
	enableTestEndpoints:
		environment.ENABLE_TEST_ENDPOINTS && environment.ENABLE_TEST_ENDPOINTS === 'true',
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
				has: {
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
				s78: {
					appellant: {
						id:
							environment.GOV_NOTIFY_APPEAL_VALID_START_CASE_S78_APPELLANT_ID ||
							'mock-appeal-valid-start-case-s78-appellant-id'
					},
					lpa: {
						id:
							environment.GOV_NOTIFY_APPEAL_VALID_START_CASE_S78_LPA_ID ||
							'mock-appeal-valid-start-case-s78-lpa-id'
					}
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
				appellant: {
					id: environment.GOV_NOTIFY_LPAQ_COMPLETE_APPELLANT_ID || 'mock-lpaq-complete-appellant-id'
				},
				lpa: {
					id: environment.GOV_NOTIFY_LPAQ_COMPLETE_ID || 'mock-lpaq-complete-id'
				}
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
			},
			finalCommentRejected: {
				appellant: {
					id:
						environment.GOV_NOTIFY_FINAL_COMMENT_REJECTED_APPELLANT_ID ||
						'mock-final-comment-rejected-appellant-id'
				},
				lpa: {
					id:
						environment.GOV_NOTIFY_FINAL_COMMENT_REJECTED_LPA_ID ||
						'mock-final-comment-rejected-lpa-id'
				}
			},
			ipCommentRejected: {
				id: environment.GOV_NOTIFY_IP_COMMENT_REJECTED_ID || 'mock-ip-comment-rejected-appellant-id'
			},
			commentRejectedDeadlineExtended: {
				id:
					environment.GOV_NOTIFY_COMMENT_REJECTED_DEADLINE_EXTENDED ||
					'mock-comment-rejected-extended-id'
			},
			statementIncomplete: {
				lpa: {
					id: environment.GOV_NOTIFY_LPA_STATEMENT_INCOMPLETE || 'mock-lpa-statement-incomplete'
				}
			},
			finalCommentsDone: {
				appellant: {
					id:
						environment.GOV_NOTIFY_APPELLANT_FINAL_COMMENTS_DONE ||
						'mock-appellant-final-comments-done-id'
				},
				lpa: {
					id: environment.GOV_NOTIFY_LPA_FINAL_COMMENTS_DONE || 'mock-lpa-final-comments-done-id'
				}
			},
			receivedStatementsAndIpComments: {
				appellant: {
					id:
						environment.GOV_NOTIFY_RECEIVED_STATEMENT_AND_IP_COMMENTS_APPELLANT_ID ||
						'mock-received-statement-and-ip-comments-appellant-id'
				},
				lpa: {
					id:
						environment.GOV_NOTIFY_RECEIVED_STATEMENT_AND_IP_COMMENTS_LPA_ID ||
						'mock-received-statement-and-ip-comments-lpa-id'
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
