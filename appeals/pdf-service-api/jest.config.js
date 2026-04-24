export default {
	testTimeout: 50000,
	transform: {},
	moduleNameMapper: {
		'^uuid$': 'uuid'
	},
	collectCoverageFrom: ['./src/**/*.js'],
	coveragePathIgnorePatterns: [
		'node_modules',
		'<rootDir>/src/app.js',
		'<rootDir>/src/main.js',
		'<rootDir>/src/server.js'
	],
	coverageThreshold: {
		global: {
			statements: 70,
			branches: 55,
			functions: 83,
			lines: 70
		}
	},
	workerThreads: false,
	workerIdleMemoryLimit: '500MB'
};
