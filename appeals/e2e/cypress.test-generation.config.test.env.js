// @ts-nocheck
const { defineConfig } = require('cypress');
const baseConfig = require('./cypress.config');

require('dotenv').config();

const e2eOverride = {
	baseUrl: 'https://back-office-appeals-test.planninginspectorate.gov.uk/',
	apiBaseUrl: 'https://pins-app-appeals-bo-api-test.azurewebsites.net/'
};

module.exports = defineConfig({
	e2e: {
		...baseConfig.e2e,
		...e2eOverride,
		specPattern: 'cypress/e2e/back-office-test-data-generation/**/*.spec.js'
	},
	env: {
		...baseConfig.env
	}
});
