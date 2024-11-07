export default {
	setupFiles: ['<rootDir>/setup-tests.js'],
	testTimeout: 30000,
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
	}
};
