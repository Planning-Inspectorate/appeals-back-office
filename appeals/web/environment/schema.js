import joi from 'joi';

const logLevel = ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'];

export const baseSchema = joi
	.object({
		buildDir: joi.string(),
		bundleAnalyzer: joi.boolean(),
		cwd: joi.string(),
		env: joi.string().valid('development', 'production', 'test', 'local'),
		isProduction: joi.boolean(),
		isDevelopment: joi.boolean(),
		isTest: joi.boolean(),
		isRelease: joi.boolean().optional(),
		gitSha: joi.string().optional()
	})
	.options({ presence: 'required' }); // all required by default

export default baseSchema
	.append({
		appHostname: joi.string(),
		appInsightsConnectionString: joi.string().optional(),
		apiUrl: joi.string().uri(),
		authDisabled: joi.boolean().optional(),
		authDisabledUserId: joi.string().optional(),
		authDisabledGroupIds: joi.array().optional(),
		authRedirectPath: joi.string(),
		betaFeedbackUrl: joi.string(),
		blobStorageUrl: joi.string(),
		blobEmulatorSasUrl: joi.string().when('useBlobEmulator', { not: 'true', then: joi.optional() }),
		blobStorageDefaultContainer: joi.string(),
		cacheControl: joi.object({ maxAge: joi.string() }).options({ presence: 'required' }),
		horizonAppealBaseUrl: joi.string().optional().empty(''),
		useBlobEmulator: joi.boolean().optional(),
		logLevelStdOut: joi.string().valid(...logLevel),
		msal: joi
			.object({
				authority: joi.string(),
				clientId: joi.string(),
				clientSecret: joi.string(),
				logoutUri: joi.string()
			})
			.options({ presence: 'required' }),
		serverProtocol: joi.string().valid('http', 'https'),
		serverPort: joi.number(),
		disableRedis: joi.boolean().optional(),
		retry: joi.object({
			maxAttempts: joi.number().optional(),
			statusCodes: joi.string().optional()
		}),
		session: joi
			.object({
				// ...env means `.env` property of the parent object
				redis: joi.string().when('...env', { not: 'production', then: joi.optional() }),
				secret: joi.string().when('...env', { is: 'test', then: joi.optional() }),
				maxAge: joi.number().optional()
			})
			.when('env', { is: 'test', then: joi.optional() }),
		sslCertificateFile: joi.string().when('serverProtocol', { is: 'http', then: joi.optional() }),
		sslCertificateKeyFile: joi
			.string()
			.when('serverProtocol', { is: 'http', then: joi.optional() }),
		referenceData: joi
			.object({
				appeals: joi
					.object({
						caseOfficerGroupId: joi.string(),
						inspectorGroupId: joi.string(),
						legalGroupId: joi.string(),
						customerServiceGroupId: joi.string(),
						padsGroupId: joi.string().optional(),
						readerGroupId: joi.string().optional()
					})
					.options({ presence: 'required' })
			})
			.options({ presence: 'required' }),
		featureFlags: joi.object().pattern(/featureFlag.*/, joi.boolean()),
		useSystemTestBcForChangeLpa: joi.boolean().optional(),
		pdfServiceHost: joi.string().optional()
	})
	.options({ presence: 'required' }); // all required by default
