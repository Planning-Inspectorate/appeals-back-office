export default {
	setupFiles: ['<rootDir>/setup-tests.js'],
	testTimeout: 50000,
	transform: {
		// NEVER transform node_modules except the uuid ESM build
		'^.+\\.[jt]sx?$': 'babel-jest',

		// Add a dedicated transform for uuid’s ESM browser build
		'^node_modules/uuid/.+\\.js$': 'babel-jest'
	},

	transformIgnorePatterns: [
		// Ignore ALL node_modules except uuid
		'/node_modules/(?!uuid/)'
	],
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
