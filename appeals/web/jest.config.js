export default {
	setupFiles: ['<rootDir>/setup-tests.js'],
	testTimeout: 50000,
	transform: {},
	moduleNameMapper: {
		'^uuid$': 'uuid'
	},
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
