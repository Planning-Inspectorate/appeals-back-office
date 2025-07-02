import puppeteer from 'puppeteer-core';
import logger from './lib/logger.js';

// @ts-ignore
let browserInstance = null;

// Minimal recommended args for running in Docker/Linux headless environments
// Removed --single-process and --no-zygote as potential causes for TargetCloseError
const minimalLaunchArgs = [
	'--disable-gpu',
	'--disable-dev-shm-usage',
	'--disable-setuid-sandbox',
	'--no-sandbox',
	'--disable-extensions',
	'--disable-component-extensions-with-background-pages'
	// Keep logging args below only if needed for deeper debugging later
	// '--enable-logging=stderr',
	// '--v=1'
];

/**
 * @returns {Promise<void>}
 */

async function launchBrowser() {
	// @ts-ignore
	if (browserInstance) {
		logger.warn('Browser instance already launched.');
		return;
	}

	const chromiumPath = '/usr/bin/chromium';

	try {
		logger.info(
			`Attempting to launch shared browser instance from: ${chromiumPath} with args: ${minimalLaunchArgs.join(
				' '
			)}`
		);

		browserInstance = await puppeteer.launch({
			executablePath: chromiumPath,
			headless: true,
			args: minimalLaunchArgs,
			dumpio: false // Stops excessive browser stdout/stderr logging for stability
		});
		logger.info('Shared browser instance launched successfully.');

		browserInstance.on('disconnected', () => {
			logger.error('Shared browser instance disconnected unexpectedly! Exiting process.');
			browserInstance = null;
			process.exit(1);
		});
	} catch (error) {
		logger.error({ err: error }, 'Failed to launch shared browser instance during startup.');
		throw error;
	}
}

/**
 * @returns {import('puppeteer-core').Browser}
 */
function getBrowserInstance() {
	// @ts-ignore
	if (!browserInstance) {
		logger.error('Attempted to get browser instance before it was launched.');
		throw new Error(
			'Browser instance is not available. Ensure launchBrowser() was called successfully on startup.'
		);
	}
	return browserInstance;
}

/**
 * @returns {Promise<void>}
 */
async function closeBrowser() {
	// @ts-ignore
	if (browserInstance) {
		logger.info('Closing shared browser instance...');
		try {
			await browserInstance.close();
			browserInstance = null;
			logger.info('Shared browser instance closed successfully.');
		} catch (error) {
			logger.error({ err: error }, 'Error closing shared browser instance.');
		}
	} else {
		logger.info('No active browser instance to close.');
	}
}

export { launchBrowser, getBrowserInstance, closeBrowser };
