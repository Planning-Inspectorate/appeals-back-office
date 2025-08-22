// @ts-nocheck
const { defineConfig } = require('cypress');
const { azureSignIn } = require('./cypress/support/login');
const baseConfig = require('./cypress.config');

require('dotenv').config();

const app = process.env.APP;

const e2eOverride = {
	baseUrl: 'https://back-office-appeals-test.planninginspectorate.gov.uk/',
	apiBaseUrl: 'https://pins-app-appeals-bo-api-test.azurewebsites.net/'
};

module.exports = defineConfig({
	e2e: {
		...baseConfig.e2e,
		...e2eOverride
	},
	env: {
		...baseConfig.env
	}
});
