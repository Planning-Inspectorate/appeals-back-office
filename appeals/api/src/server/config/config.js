import { loadEnvironment } from '@pins/platform';
import { APPEAL_ALLOCATION_LEVEL } from '@planning-inspectorate/data-model';
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
	DATABASE_URL: environment.DATABASE_URL
		? `${environment.DATABASE_URL}${
				environment.DB_CONNECTION_LIMIT
					? `;connection_limit=${environment.DB_CONNECTION_LIMIT};`
					: ''
			}`
		: undefined,
	BO_BLOB_STORAGE_ACCOUNT: environment.BO_BLOB_STORAGE_ACCOUNT,
	BO_BLOB_CONTAINER: environment.BO_BLOB_CONTAINER,
	blobEmulatorSasUrl: environment.AZURE_BLOB_EMULATOR_SAS_HOST,
	useBlobEmulator: environment.AZURE_BLOB_USE_EMULATOR || false,
	useNotifyEmulator: environment.NOTIFY_SEND_MAIL_EMULATOR || false,
	defaultApiVersion: environment.DEFAULT_API_VERSION || '1',
	serviceBusOptions: {
		hostname: environment.SERVICE_BUS_HOSTNAME,
		topicAppealHas: environment.SB_TOPIC_NAME_APPEAL_HAS || 'appeal-has',
		topicAppealS78: environment.SB_TOPIC_NAME_APPEAL_S78 || 'appeal-s78',
		topicAppealDocument: environment.SB_TOPIC_NAME_APPEAL_DOCUMENT || 'appeal-document',
		topicAppealServiceUser: environment.SB_TOPIC_NAME_APPEAL_SERVICE_USER || 'appeal-service-user',
		topicAppealEvent: environment.SB_TOPIC_NAME_APPEAL_EVENT || 'appeal-event',
		topicAppealEventEstimate:
			environment.SB_TOPIC_NAME_APPEAL_EVENT_ESTIMATE || 'appeal-event-estimate',
		topicDocumentMove: environment.SB_TOPIC_NAME_DOCUMENT_MOVE || 'appeal-document-to-move',
		topicAppealRepresentation:
			environment.SB_TOPIC_NAME_APPEAL_REPRESENTATION || 'appeal-representation'
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
		featureFlagS78Inquiry:
			environment.FEATURE_FLAG_S78_INQUIRY && environment.FEATURE_FLAG_S78_INQUIRY === 'true',
		featureFlagS20Hearing:
			environment.FEATURE_FLAG_S20_HEARING && environment.FEATURE_FLAG_S20_HEARING === 'true',
		featureFlagS20Inquiry:
			environment.FEATURE_FLAG_S20_INQUIRY && environment.FEATURE_FLAG_S20_INQUIRY === 'true',
		featureFlagLinkedAppeals:
			environment.FEATURE_FLAG_LINKED_APPEALS && environment.FEATURE_FLAG_LINKED_APPEALS === 'true',
		featureFlagLinkedAppealsUnlink:
			environment.FEATURE_FLAG_LINKED_APPEALS_UNLINK &&
			environment.FEATURE_FLAG_LINKED_APPEALS_UNLINK === 'true',
		featureFlagNetResidence:
			environment.FEATURE_FLAG_NET_RESIDENCE && environment.FEATURE_FLAG_NET_RESIDENCE === 'true',
		featureFlagNetResidenceS20:
			environment.FEATURE_FLAG_NET_RESIDENCE_S20 &&
			environment.FEATURE_FLAG_NET_RESIDENCE_S20 === 'true',
		featureFlagHearingPostMvp:
			environment.FEATURE_FLAG_HEARING_POST_MVP &&
			environment.FEATURE_FLAG_HEARING_POST_MVP === 'true',
		featureFlagSearchCaseOfficer:
			environment.FEATURE_FLAG_SEARCH_CASE_OFFICER &&
			environment.FEATURE_FLAG_SEARCH_CASE_OFFICER === 'true',
		featureFlagEnforcementNotice:
			environment.FEATURE_FLAG_ENFORCEMENT_NOTICE &&
			environment.FEATURE_FLAG_ENFORCEMENT_NOTICE === 'true',
		featureFlagEnforcementLinked:
			environment.FEATURE_FLAG_ENFORCEMENT_LINKED &&
			environment.FEATURE_FLAG_ENFORCEMENT_LINKED === 'true',
		featureFlagInvalidDecisionLetter:
			environment.FEATURE_FLAG_INVALID_DECISION_LETTER &&
			environment.FEATURE_FLAG_INVALID_DECISION_LETTER === 'true',
		featureFlagRule6Mvp:
			environment.FEATURE_FLAG_RULE_6_MVP && environment.FEATURE_FLAG_RULE_6_MVP === 'true',
		featureFlagRule6PoE:
			environment.FEATURE_FLAG_RULE_6_POE && environment.FEATURE_FLAG_RULE_6_POE === 'true',
		featureFlagRule6Statement:
			environment.FEATURE_FLAG_RULE_6_STATEMENT &&
			environment.FEATURE_FLAG_RULE_6_STATEMENT === 'true',
		featureFlagExpeditedAppeals:
			environment.FEATURE_FLAG_EXPEDITED_APPEALS &&
			environment.FEATURE_FLAG_EXPEDITED_APPEALS === 'true',
		featureFlagRule6Costs:
			environment.FEATURE_FLAG_RULE_6_COSTS && environment.FEATURE_FLAG_RULE_6_COSTS === 'true',
		featureFlagLDC: environment.FEATURE_FLAG_LDC && environment.FEATURE_FLAG_LDC === 'true'
	},
	serviceBusEnabled: environment.SERVICE_BUS_ENABLED && environment.SERVICE_BUS_ENABLED === 'true',
	enableTestEndpoints:
		environment.ENABLE_TEST_ENDPOINTS && environment.ENABLE_TEST_ENDPOINTS === 'true',
	forcePersonalListFullRefresh:
		environment.FORCE_PERSONAL_LIST_FULL_REFRESH &&
		environment.FORCE_PERSONAL_LIST_FULL_REFRESH === 'true',
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
		{ level: APPEAL_ALLOCATION_LEVEL.A, band: 3 },
		{ level: APPEAL_ALLOCATION_LEVEL.B, band: 3 },
		{ level: APPEAL_ALLOCATION_LEVEL.C, band: 2 },
		{ level: APPEAL_ALLOCATION_LEVEL.D, band: 2 },
		{ level: APPEAL_ALLOCATION_LEVEL.E, band: 1 },
		{ level: APPEAL_ALLOCATION_LEVEL.F, band: 1 },
		{ level: APPEAL_ALLOCATION_LEVEL.G, band: 1 },
		{ level: APPEAL_ALLOCATION_LEVEL.H, band: 1 }
	],
	horizon: {
		url: environment.SRV_HORIZON_URL,
		mock: environment.MOCK_HORIZON,
		timeoutLimit: environment.TIMEOUT_LIMIT_HORIZON || 5000
	},
	frontOffice: {
		url: environment.FRONT_OFFICE_URL || '/mock-front-office-url'
	},
	requestSizeLimit: environment.REQUEST_SIZE_LIMIT || '1mb'
});

if (error) {
	throw new Error(`loadConfig validation error: ${error.message}`);
}

export default value;
