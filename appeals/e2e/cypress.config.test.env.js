// cypress.config.test.env.js
// @ts-nocheck
const { defineConfig } = require('cypress');
const baseConfig = require('./cypress.config');
require('dotenv').config();

module.exports = defineConfig({
	e2e: {
		...baseConfig.e2e,
		baseUrl: 'https://back-office-appeals-test.planninginspectorate.gov.uk/'
	},
	env: {
		...baseConfig.env,
		apiBaseUrl: 'https://pins-app-appeals-bo-api-test.azurewebsites.net/'
	}
});
