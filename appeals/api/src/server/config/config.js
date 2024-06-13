import { loadEnvironment } from '@pins/platform';
import url from 'node:url';
import schema from './schema.js';

const environment = loadEnvironment(process.env.NODE_ENV);

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
		levelFile: environment.LOG_LEVEL_FILE || 'silent',
		levelStdOut: environment.LOG_LEVEL_STDOUT || 'debug'
	},
	cwd: url.fileURLToPath(new URL('..', import.meta.url)),
	// flag name convention: featureFlag[ jira number ][ferature shoret description]
	// set Feature Flag default val here [default: false] - will be overwritted by values cming from the .env file
	featureFlags: {
		featureFlagBoas1TestFeature: !environment.FEATURE_FLAG_BOAS_1_TEST_FEATURE
			? false
			: environment.FEATURE_FLAG_BOAS_1_TEST_FEATURE === 'true'
	},
	serviceBusEnabled: environment.SERVICE_BUS_ENABLED && environment.SERVICE_BUS_ENABLED === 'true',
	govNotify: {
		api: {
			key: environment.GOV_NOTIFY_API_KEY
		},
		template: {
			validAppellantCase: {
				id: '3b4b74b4-b604-411b-9c98-5be2c6f3bdfd'
			},
			appealConfirmed: {
				id: '783f94cc-1d6d-4153-8ad7-9070e449a57c'
			},
			appealIncomplete: {
				id: 'f9cbd646-be00-45e2-96fc-f47e585e5b5e'
			},
			appealInvalid: {
				id: '59c8337a-e854-4fc4-8c83-aa958b91bd99'
			},
			decisionIsInvalidAppellant: {
				id: 'bd117483-e7fe-4655-8f57-cf597ad57710'
			},
			decisionIsInvalidLPA: {
				id: 'a0cb542f-24d3-4b22-826b-1e012892f922'
			},
			lpaqComplete: {
				id: 'c571ee53-69c8-400e-a4c0-44ded262a081'
			},
			lpaqIncomplete: {
				id: '4701bc3c-2f24-4ed8-8841-14d93c3b9964'
			},
			siteVisitSchedule: {
				unaccompanied: {
					appellant: {
						id: 'a33bb800-56d9-46a4-ba64-35d9d0263666'
					}
				},
				accompanied: {
					appellant: {
						id: '4002346f-fd65-42fe-b663-36600b85080c'
					},
					lpa: {
						id: '03a6616e-3e0c-4f28-acd5-f4e873847457'
					}
				},
				accessRequired: {
					appellant: {
						id: '44ff947d-f93d-4333-9366-97ab7a5aa722'
					}
				}
			},
			siteVisitChange: {
				unaccompaniedToAccessRequired: {
					appellant: {
						id: 'f9bd99e7-f3f1-4836-a2dc-018dfdece854'
					}
				},
				unaccompaniedToAccompanied: {
					appellant: {
						id: '771691cb-81cc-444a-8db0-dbbd4f66b61f'
					},
					lpa: {
						id: '03a6616e-3e0c-4f28-acd5-f4e873847457'
					}
				},
				accessRequiredToAccompanied: {
					appellant: {
						id: '0b7d9246-99b8-43d7-8205-02a3c9762691'
					},
					lpa: {
						id: '03a6616e-3e0c-4f28-acd5-f4e873847457'
					}
				},
				accessRequiredToUnaccompanied: {
					appellant: {
						id: 'a4964a74-af84-45c2-a61b-162a92f94087'
					}
				},
				accompaniedToAccessRequired: {
					appellant: {
						id: 'f9bd99e7-f3f1-4836-a2dc-018dfdece854'
					},
					lpa: {
						id: '15acdaee-ca9d-4001-bb93-9f50ab29226d'
					}
				},
				accompaniedToUnaccompanied: {
					appellant: {
						id: '5056b6fe-095f-45ad-abb5-0a582ef274c3'
					},
					lpa: {
						id: '15acdaee-ca9d-4001-bb93-9f50ab29226d'
					}
				},
				accessRequiredDateChange: {
					appellant: {
						id: '1b963d2c-ae50-45c4-abbb-149481c69074'
					}
				},
				accompaniedDateChange: {
					appellant: {
						id: '3bd2cd75-bf1e-4256-8a4c-5c5739bc0ecc'
					},
					lpa: {
						id: '5d23f669-a1d2-4232-9171-10f956dfb400'
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
		mock: environment.MOCK_HORIZON
	}
});

if (error) {
	throw new Error(`loadConfig validation error: ${error.message}`);
}

export default value;
