// @ts-nocheck
const { defineConfig } = require('cypress');
const baseConfig = require('./cypress.config');

require('dotenv').config();

// use backoffice defaults if not set
if (!baseConfig.e2e.baseUrl) {
	baseConfig.e2e.baseUrl = 'https://localhost:8080/';
}

if (!baseConfig.e2e.apiBaseUrl) {
	baseConfig.e2e.apiBaseUrl = 'http://localhost:3000/';
}

module.exports = defineConfig({
	e2e: {
		...baseConfig.e2e,
		specPattern: 'cypress/e2e/back-office-test-data-generation/**/*.spec.js'
	},
	env: {
		...baseConfig.env
	}
});
