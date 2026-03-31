export default {
	transform: {},
	moduleNameMapper: { '^uuid$': 'uuid' },
	globalSetup: './stored-procedures.global-setup.js',
	globalTeardown: './stored-procedures.global-teardown.js',
	setupFiles: ['<rootDir>/stored-procedures.setup.js'],
	testMatch: ['<rootDir>/src/server/tests/stored-procedures/**/*.integration.test.js'],
	testTimeout: 180000
};
