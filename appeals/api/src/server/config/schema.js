import joi from 'joi';

export default joi
	.object({
		gitSha: joi.string().optional(),
		NODE_ENV: joi.string().valid('development', 'production', 'test'),
		PORT: joi.number(),
		SWAGGER_JSON_DIR: joi.string(),
		APPLICATIONINSIGHTS_CONNECTION_STRING: joi.string().optional(),
		DATABASE_URL: joi.string(),
		BO_BLOB_STORAGE_ACCOUNT: joi.string(),
		BO_BLOB_CONTAINER: joi.string(),
		blobEmulatorSasUrl: joi.string().optional(),
		useBlobEmulator: joi.boolean(),
		useNotifyEmulator: joi.boolean(),
		defaultApiVersion: joi.string(),
		serviceBusOptions: joi.object({
			hostname: joi.string().optional()
		}),
		msal: joi.object({
			clientId: joi.string().optional(),
			clientSecret: joi.string().optional(),
			tenantId: joi.string().optional()
		}),
		log: joi.object({
			levelStdOut: joi.string()
		}),
		cwd: joi.string(),
		featureFlags: joi.object().pattern(/featureFlag.*/, joi.boolean()),
		serviceBusEnabled: joi.boolean().optional(),
		enableTestEndpoints: joi.boolean().optional(),
		govNotify: joi
			.object({
				api: joi.object({
					key: joi.string() // optional if not NODE_ENV=production
				}),
				template: joi
					.object({
						generic: joi.object({
							id: joi.string().required()
						}),
						siteVisitChange: joi.object({
							accompaniedDateChange: joi.object({
								appellant: joi.object({
									id: joi.string().required()
								}),
								lpa: joi.object({
									id: joi.string().required()
								})
							}),
							accompaniedToAccessRequired: joi.object({
								appellant: joi.object({
									id: joi.string().required()
								}),
								lpa: joi.object({
									id: joi.string().required()
								})
							}),
							accompaniedToUnaccompanied: joi.object({
								appellant: joi.object({
									id: joi.string().required()
								}),
								lpa: joi.object({
									id: joi.string().required()
								})
							}),
							accessRequiredDateChange: joi.object({
								appellant: joi.object({
									id: joi.string().required()
								})
							}),
							accessRequiredToAccompanied: joi.object({
								appellant: joi.object({
									id: joi.string().required()
								}),
								lpa: joi.object({
									id: joi.string().required()
								})
							}),
							accessRequiredToUnaccompanied: joi.object({
								appellant: joi.object({
									id: joi.string().required()
								})
							}),
							unaccompaniedToAccessRequired: joi.object({
								appellant: joi.object({
									id: joi.string().required()
								})
							}),
							unaccompaniedToAccompanied: joi.object({
								appellant: joi.object({
									id: joi.string().required()
								}),
								lpa: joi.object({
									id: joi.string().required()
								})
							})
						}),
						siteVisitSchedule: joi.object({
							accompanied: joi.object({
								appellant: joi.object({
									id: joi.string().required()
								}),
								lpa: joi.object({
									id: joi.string().required()
								})
							}),
							accessRequired: joi.object({
								appellant: joi.object({
									id: joi.string().required()
								})
							}),
							unaccompanied: joi.object({
								appellant: joi.object({
									id: joi.string().required()
								})
							})
						})
					})
					.required(),

				testMailbox: joi.string().required()
			})
			.when('NODE_ENV', {
				not: 'production',
				then: joi.object({ api: joi.object({ key: joi.optional() }) })
			}),
		appealAllocationLevels: joi.array().items(
			joi.object({
				level: joi.string(),
				band: joi.number()
			})
		),
		horizon: joi.object({
			url: joi.string().optional(),
			mock: joi.bool().optional(),
			timeoutLimit: joi.number().optional()
		})
	})
	.options({ presence: 'required' }); // required by default;
