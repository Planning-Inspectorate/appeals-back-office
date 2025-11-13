// @ts-nocheck
const { defineConfig } = require('cypress');
const baseConfig = require('./cypress.config');

require('dotenv').config();

baseConfig.e2e.baseUrl = 'https://back-office-appeals-test.planninginspectorate.gov.uk/';
baseConfig.e2e.apiBaseUrl = 'https://pins-app-appeals-bo-api-test.azurewebsites.net/';

module.exports = defineConfig({
	e2e: {
		...baseConfig.e2e,
		specPattern: 'cypress/e2e/back-office-test-data-generation/**/*.spec.js'
	},
	env: {
		...baseConfig.env
	}
});
