export default {
	transform: {},
	moduleNameMapper: { '^uuid$': 'uuid' },
	setupFilesAfterEnv: ['<rootDir>/setup-tests.js'],
	coverageThreshold: {
		global: {
			branches: 50,
			functions: 65,
			lines: 70,
			statements: 70
		},
		// to improve and increase the coverage thresholds
		'./src/server/endpoints/integrations': {
			branches: 5.85,
			functions: 10.86,
			lines: 26.05,
			statements: 25.51
		}
	}
};
