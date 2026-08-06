// @ts-nocheck
const { defineConfig } = require('cypress');
const baseConfig = require('./cypress.config');

// prettier-ignore
try { require('node:process').loadEnvFile(); } catch {/* ignore errors*/}

const app = process.env.APP;

const e2eOverride = {
	baseUrl: 'https://back-office-appeals-dev.planninginspectorate.gov.uk/',
	apiBaseUrl: 'https://pins-app-appeals-bo-api-dev.azurewebsites.net/'
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
