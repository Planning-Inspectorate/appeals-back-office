export default {
	transform: {},
	moduleNameMapper: { '^uuid$': 'uuid' },
	globalSetup: './global-setup.js',
	setupFilesAfterEnv: ['<rootDir>/setup-tests.js'],
	reporters: ['default', 'jest-slow-test-reporter'],
	coverageThreshold: {
		global: {
			branches: 50,
			functions: 65,
			lines: 70,
			statements: 70
		}
	},
	workerThreads: true,
	workerIdleMemoryLimit: '500MB'
};
