import { LevelWithSilent } from 'pino';

/**
 * Configuration required for bundling or build steps, not running the application.
 * Loaded from the process environment, and .env files.
 */
export interface BaseEnvironmentConfig {
	buildDir: string;
	bundleAnalyzer: boolean;
	cwd: string;
	env: 'development' | 'test' | 'production' | 'local';
	isProduction: boolean;
	isDevelopment: boolean;
	isTest: boolean;
	isRelease?: boolean;
}

/**
 * Configuration required for running the application.
 * Loaded from the process environment, and .env files.
 */
export interface EnvironmentConfig extends BaseEnvironmentConfig {
	// The web application hostname (e.g. back-office-dev.planninginspectorate.gov.uk)
	appHostname: string;
	gitSha?: string;
	appInsightsConnectionString?: string;
	apiUrl: string;
	authDisabled: boolean;
	authDisabledGroupIds: string[];
	authDisabledUserId: string;
	// redirect path for MSAL auth, defaults to /auth/redirect
	authRedirectPath: string;
	betaFeedbackUrl: string;
	blobStorageUrl: string;
	blobStorageDefaultContainer: string;
	blobEmulatorSasUrl: string;
	cacheControl: {
		maxAge: string;
	};
	horizonAppealBaseUrl?: string;
	useBlobEmulator: boolean;
	cwd: string;
	logLevelStdOut: LevelWithSilent;
	msal: {
		authority: string;
		clientId: string;
		clientSecret: string;
		redirectUri: string;
		logoutUri: string;
	};
	retry: {
		maxAttempts: number;
		statusCodes: string;
	};
	serverProtocol: 'http' | 'https';
	serverPort: number;
	disableRedis: boolean;
	session: {
		redis: string;
		secret: string;
		maxAge: number;
	};
	sslCertificateFile: string;
	sslCertificateKeyFile: string;
	referenceData: {
		appeals: {
			caseOfficerGroupId: string;
			inspectorGroupId: string;
			legalGroupId: string;
			customerServiceGroupId: string;
			padsGroupId: string;
			readerGroupId: string;
		};
	};
	featureFlags: {
		[key: string]: boolean;
	};
	useSystemTestBcForChangeLpa: boolean;
	pdfServiceHost: string;
}

export function loadConfig(): EnvironmentConfig;

const config: EnvironmentConfig;
export default config;
