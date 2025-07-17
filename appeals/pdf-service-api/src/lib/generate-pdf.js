/* eslint-disable no-unused-vars */

import logger from './logger.js';

/**
 *
 * @param {import('puppeteer-core').Browser} browser
 * @param {string} html
 * @returns {Promise<Buffer>}
 * @throws {Error}
 */
export default async (browser, html) => {
	logger.info('generatePdfLib (optimized): Starting PDF generation using shared browser.');
	let page = null;

	try {
		if (!browser || typeof browser.newPage !== 'function') {
			logger.error('generatePdfLib received invalid browser instance.');
			throw new Error('Invalid browser instance provided for PDF generation.');
		}
		if (!html || typeof html !== 'string' || html.trim().length === 0) {
			logger.error('generatePdfLib received empty or invalid HTML content.');
			throw new Error('Cannot generate PDF from empty or invalid HTML content.');
		}
		logger.info(`generatePdfLib: Received HTML content (length: ${html.length}).`);

		logger.info('generatePdfLib: Creating new page...');
		page = await browser.newPage();
		logger.info('generatePdfLib: New page created successfully.');

		// Set up Event Listeners

		page.on('console', (msg) => logger.info(`PAGE CONSOLE (${msg.type()}): ${msg.text()}`));
		page.on('requestfailed', (request) => {
			const failure = request.failure();
			logger.error(
				`PAGE FAILED RESOURCE: ${request.method()} ${request.url()} - ${failure?.errorText}`
			);
		});
		page.on('pageerror', (pageErr) => logger.error({ err: pageErr }, 'PAGE JAVASCRIPT ERROR'));
		page.on('error', (err) => logger.error({ err }, 'PAGE CRASH ERROR'));

		//Set Page Content
		logger.info('generatePdfLib: Setting page content. Waiting for DOM content loaded...');
		await page.setContent(html, {
			waitUntil: 'domcontentloaded',
			timeout: 60000 //Timeout for potentially slow rendering, can be removed but would not recommend
		});
		logger.info('generatePdfLib: Page content set successfully.');

		await page.emulateMediaType('screen');

		// Generate PDF
		logger.info('generatePdfLib: Generating PDF buffer...');
		const pdfOptions = {
			format: 'A4',
			printBackground: true,
			margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
			scale: 1.0,
			timeout: 60000
		};
		// @ts-ignore
		const pdfUint8Array = await page.pdf(pdfOptions);
		logger.info(`generatePdfLib: PDF buffer generated, size: ${pdfUint8Array.length} bytes.`);

		const pdfBuffer = Buffer.from(pdfUint8Array);
		logger.info('generatePdfLib: PDF generation complete. Returning Buffer.');
		return pdfBuffer;
	} catch (err) {
		logger.error({ err }, 'generatePdfLib: Error during page processing or PDF generation.');
		throw err;
	} finally {
		// Makes sure page is Closed
		if (page) {
			logger.info('generatePdfLib: Closing page...');
			try {
				await page.close();
				logger.info('generatePdfLib: Page closed successfully.');
			} catch (closeErr) {
				logger.error({ err: closeErr }, 'generatePdfLib: Error occurred while closing page.');
			}
		}
		// Don't close the browser as it's shared to improve download speed
	}
};
