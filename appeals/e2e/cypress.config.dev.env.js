// @ts-nocheck
const { defineConfig } = require('cypress');
const baseConfig = require('./cypress.config');

module.exports = defineConfig({
	e2e: {
		...baseConfig.e2e,
		baseUrl: 'https://back-office-appeals-dev.planninginspectorate.gov.uk/'
	},
	env: {
		...baseConfig.env,
		apiBaseUrl: 'https://pins-app-appeals-bo-api-dev.azurewebsites.net/'
	}
});
