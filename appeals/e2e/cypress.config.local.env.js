// @ts-nocheck
const { defineConfig } = require('cypress');
const baseConfig = require('./cypress.config');

// prettier-ignore
try { require('node:process').loadEnvFile(); } catch {/* ignore errors*/}

// use backoffice defaults if not set
if (!baseConfig.e2e.baseUrl) {
	baseConfig.e2e.baseUrl = 'https://localhost:8080/';
}

if (!baseConfig.e2e.apiBaseUrl) {
	baseConfig.e2e.apiBaseUrl = 'http://localhost:3000/';
}

module.exports = defineConfig({
	e2e: {
		...baseConfig.e2e
	},
	env: {
		...baseConfig.env
	}
});
