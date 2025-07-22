import { loadEnvironment } from '@pins/platform';
import schema from './schema.js';
import { baseConfigFromEnvironment } from './base-config.js';
import url from 'url';
import path from 'path';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const webDir = path.join(__dirname, '..'); // web package root, where .env files live

/**
 * @typedef {import('./config.js').EnvironmentConfig} EnvironmentConfig
 */

/**
 * Loaded config, it only needs loading once
 * @type {EnvironmentConfig|undefined}
 */
let loadedConfig;

/**
 * Load environment settings, and returns validated config.
 *
 * @returns {EnvironmentConfig}
 */
export function loadConfig() {
	if (loadedConfig) {
		return loadedConfig;
	}
	const environment = loadEnvironment(process.env.NODE_ENV, webDir);
	const baseConfig = baseConfigFromEnvironment(environment);
	// defaults where needed
	const {
		API_HOST,
		APP_HOSTNAME,
		APPLICATIONINSIGHTS_CONNECTION_STRING,
		APPEALS_CASE_OFFICER_GROUP_ID,
		APPEALS_INSPECTOR_GROUP_ID,
		APPEALS_LEGAL_TEAM_GROUP_ID,
		APPEALS_CS_TEAM_GROUP_ID,
		APPEALS_PADS_GROUP_ID,
		APPEALS_READERS_GROUP_ID,
		AUTH_CLIENT_ID = '*',
		AUTH_CLIENT_SECRET = '*',
		AUTH_DISABLED_GROUP_IDS = '',
		AUTH_DISABLED_USER_ID,
		AUTH_DISABLED,
		AUTH_REDIRECT_PATH = '/auth/redirect',
		AUTH_TENANT_ID = '*',
		AZURE_BLOB_STORE_HOST,
		AZURE_BLOB_DEFAULT_CONTAINER,
		AZURE_BLOB_EMULATOR_SAS_HOST,
		AZURE_BLOB_USE_EMULATOR,
		BETA_FEEDBACK_URL,
		CACHE_CONTROL_MAX_AGE,
		FEATURE_FLAG_S78_WRITTEN,
		FEATURE_FLAG_S78_HEARING,
		FEATURE_FLAG_S78_INQUIRY,
		FEATURE_FLAG_LINKED_APPEALS,
		FEATURE_FLAG_S20,
		FEATURE_FLAG_CAS,
		FEATURE_FLAG_ISSUE_DECISION,
		FEATURE_FLAG_RE_ISSUE_DECISION,
		FEATURE_FLAG_NOTIFY_CASE_HISTORY,
		FEATURE_FLAG_SIMPLIFY_TEAM_ASSIGNMENT,
		FEATURE_FLAG_CHANGE_APPEAL_TYPE,
		FEATURE_FLAG_PDF_DOWNLOAD,
		HORIZON_APPEAL_BASE_URL,
		HTTP_PORT = 8080,
		HTTPS_ENABLED,
		HTTPS_PORT,
		LOG_LEVEL_STDOUT,
		DISABLE_REDIS,
		PDF_SERVICE_HOST,
		REDIS_CONNECTION_STRING,
		SESSION_SECRET,
		SESSION_MAX_AGE,
		SSL_CERT_FILE,
		SSL_KEY_FILE,
		RETRY_MAX_ATTEMPTS,
		RETRY_STATUS_CODES,
		USE_SYSTEM_TEST_BC_FOR_CHANGE_LPA
	} = environment;

	const config = {
		...baseConfig,
		appHostname: APP_HOSTNAME,
		appInsightsConnectionString: APPLICATIONINSIGHTS_CONNECTION_STRING,
		apiUrl: API_HOST,
		authDisabled: AUTH_DISABLED,
		authDisabledGroupIds: AUTH_DISABLED_GROUP_IDS.split(','),
		authDisabledUserId: AUTH_DISABLED_USER_ID,
		authRedirectPath: AUTH_REDIRECT_PATH,
		betaFeedbackUrl: BETA_FEEDBACK_URL,
		blobStorageUrl: AZURE_BLOB_STORE_HOST,
		blobStorageDefaultContainer: AZURE_BLOB_DEFAULT_CONTAINER,
		blobEmulatorSasUrl: AZURE_BLOB_EMULATOR_SAS_HOST,
		cacheControl: {
			maxAge: CACHE_CONTROL_MAX_AGE || '1d'
		},
		horizonAppealBaseUrl: HORIZON_APPEAL_BASE_URL,
		useBlobEmulator: AZURE_BLOB_USE_EMULATOR === 'true',
		logLevelStdOut: LOG_LEVEL_STDOUT,
		msal: {
			clientId: AUTH_CLIENT_ID,
			clientSecret: AUTH_CLIENT_SECRET,
			authority: `https://login.microsoftonline.com/${AUTH_TENANT_ID}`,
			logoutUri: 'https://login.microsoftonline.com/common/oauth2/v2.0/logout'
		},
		serverPort: HTTPS_ENABLED === 'true' ? HTTPS_PORT : HTTP_PORT,
		serverProtocol: HTTPS_ENABLED === 'true' ? 'https' : 'http',
		disableRedis: DISABLE_REDIS || false,
		session: {
			redis: REDIS_CONNECTION_STRING,
			secret: SESSION_SECRET,
			maxAge: SESSION_MAX_AGE
		},
		retry: {
			maxAttempts: RETRY_MAX_ATTEMPTS,
			statusCodes: RETRY_STATUS_CODES
		},
		sslCertificateFile: SSL_CERT_FILE,
		sslCertificateKeyFile: SSL_KEY_FILE,
		referenceData: {
			appeals: {
				caseOfficerGroupId: APPEALS_CASE_OFFICER_GROUP_ID,
				inspectorGroupId: APPEALS_INSPECTOR_GROUP_ID,
				legalGroupId: APPEALS_LEGAL_TEAM_GROUP_ID,
				customerServiceGroupId: APPEALS_CS_TEAM_GROUP_ID,
				padsGroupId: APPEALS_PADS_GROUP_ID,
				readerGroupId: APPEALS_READERS_GROUP_ID
			}
		},
		// flag name convention: featureFlag[ jira number ][feature short description]
		// set Feature Flag default val here [default: false] - will be overwritted by values coming from the .env file
		featureFlags: {
			featureFlagS78Written: FEATURE_FLAG_S78_WRITTEN === 'true',
			featureFlagS78Hearing: FEATURE_FLAG_S78_HEARING === 'true',
			featureFlagS78Inquiry: FEATURE_FLAG_S78_INQUIRY === 'true',
			featureFlagLinkedAppeals: FEATURE_FLAG_LINKED_APPEALS === 'true',
			featureFlagS20: FEATURE_FLAG_S20 === 'true',
			featureFlagCAS: FEATURE_FLAG_CAS === 'true',
			featureFlagIssueDecision: FEATURE_FLAG_ISSUE_DECISION === 'true',
			featureFlagReIssueDecision: FEATURE_FLAG_RE_ISSUE_DECISION === 'true',
			featureFlagNotifyCaseHistory: FEATURE_FLAG_NOTIFY_CASE_HISTORY === 'true',
			featureFlagSimplifyTeamAssignment: FEATURE_FLAG_SIMPLIFY_TEAM_ASSIGNMENT === 'true',
			featureFlagChangeAppealType: FEATURE_FLAG_CHANGE_APPEAL_TYPE === 'true',
			featureFlagPdfDownload: FEATURE_FLAG_PDF_DOWNLOAD === 'true'
		},
		useSystemTestBcForChangeLpa: USE_SYSTEM_TEST_BC_FOR_CHANGE_LPA,
		pdfServiceHost: PDF_SERVICE_HOST
	};

	const { value: validatedConfig, error } = schema.validate(config);

	if (error) {
		throw new Error(`loadConfig validation error: ${error.message}`);
	}

	loadedConfig = validatedConfig;
	return validatedConfig;
}

export default loadConfig();
