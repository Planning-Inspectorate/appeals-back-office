// @ts-nocheck
const { defineConfig } = require('cypress');
const { azureSignIn } = require('./cypress/support/login');
const {
	clearAllCookies,
	cookiesFileExists,
	getCookiesFileContents,
	getConfigByFile,
	deleteDownloads,
	deleteUnwantedFixtures,
	validateDownloadedFile
} = require('./cypress/support/cypressUtils');
const { getSpecPattern } = require('./cypress/support/utils/getSpecPattern');

require('dotenv').config();

const app = process.env.APP;

module.exports = defineConfig({
	e2e: {
		async setupNodeEvents(on, config) {
			on('task', { AzureSignIn: azureSignIn });
			on('task', { ClearAllCookies: clearAllCookies });
			on('task', { CookiesFileExists: cookiesFileExists });
			on('task', { DeleteDownloads: deleteDownloads });
			on('task', { DeleteUnwantedFixtures: deleteUnwantedFixtures });
			on('task', { GetConfigByFile: getConfigByFile });
			on('task', { GetCookiesFileContents: getCookiesFileContents });
			on('task', { ValidateDownloadedFile: validateDownloadedFile });
			return config;
		},
		baseUrl: process.env.BASE_URL,
		apiBaseUrl: process.env.API_BASE_URL,
		env: {
			PASSWORD: process.env.USER_PASSWORD,
			CASE_TEAM_EMAIL: process.env.CASE_TEAM_EMAIL,
			CASE_ADMIN_EMAIL: process.env.CASE_ADMIN_EMAIL,
			INSPECTOR_EMAIL: process.env.INSPECTOR_EMAIL,
			VALIDATION_OFFICER_EMAIL: process.env.VALIDATION_OFFICER_EMAIL,
			HAPPY_PATH_EMAIL: process.env.HAPPY_PATH_EMAIL
		},
		specPattern: getSpecPattern(app),
		supportFile: './cypress/support/e2e.js',
		viewportHeight: 960,
		viewportWidth: 1536,
		defaultCommandTimeout: 30000,
		pageLoadTimeout: 60000,
		experimentalModifyObstructiveThirdPartyCode: true,
		experimentalRunAllSpecs: true,
		chromeWebSecurity: false,
		video: false,
		retries: 0
	}
});
