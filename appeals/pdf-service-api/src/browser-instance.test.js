/* eslint-disable no-unused-vars */
// @ts-nocheck
import { jest } from '@jest/globals';

// eslint-disable-next-line jest/no-disabled-tests
describe.skip('browser-instance', () => {
	let mockBrowser;

	let launchBrowser, getBrowserInstance, closeBrowser;

	beforeEach(async () => {
		jest.clearAllMocks();
		jest.resetModules();
		jest.mock('puppeteer-core');
		jest.mock('./lib/logger', () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() }));
		const puppeteerRetry = await import('puppeteer-core');

		const browserInstanceModule = await import('./browser-instance');
		launchBrowser = browserInstanceModule.launchBrowser;
		getBrowserInstance = browserInstanceModule.getBrowserInstance;
		closeBrowser = browserInstanceModule.closeBrowser;
		mockBrowser = {
			close: jest.fn().mockResolvedValue(undefined),
			on: jest.fn()
		};

		puppeteerRetry.launch.mockResolvedValue(mockBrowser);
	});

	describe('launchBrowser', () => {
		it('should launch puppeteer and attach listener', async () => {
			const currentPuppeteer = require('puppeteer-core');
			const currentLogger = require('./lib/logger');

			await launchBrowser();

			expect(currentPuppeteer.launch).toHaveBeenCalledTimes(1);
			expect(currentPuppeteer.launch).toHaveBeenCalledWith(
				expect.objectContaining({
					executablePath: '/usr/bin/chromium'
				})
			);

			expect(mockBrowser.on).toHaveBeenCalledWith('disconnected', expect.any(Function));
			expect(currentLogger.info).toHaveBeenCalledWith(
				'Shared browser instance launched successfully.'
			);
		});

		it('should only launch the browser once', async () => {
			const currentPuppeteer = require('puppeteer-core');
			const currentLogger = require('./lib/logger');

			await launchBrowser();
			await launchBrowser();

			expect(currentPuppeteer.launch).toHaveBeenCalledTimes(1);
			expect(currentLogger.warn).toHaveBeenCalledWith('Browser instance already launched.');
		});

		it('should throw and log error if puppeteer.launch fails', async () => {
			const currentPuppeteer = require('puppeteer-core');
			const currentLogger = require('./lib/logger');
			const launchError = new Error('Launch Failed');
			currentPuppeteer.launch.mockRejectedValueOnce(launchError);

			await expect(launchBrowser()).rejects.toThrow(launchError);
			expect(currentLogger.error).toHaveBeenCalledWith(
				{ err: launchError },
				'Failed to launch shared browser instance during startup.'
			);
			expect(mockBrowser.on).not.toHaveBeenCalled();
		});
	});

	describe('getBrowserInstance', () => {
		it('should return the launched browser instance after launch', async () => {
			await launchBrowser();
			const instance = getBrowserInstance();
			expect(instance).toBe(mockBrowser);
		});

		it('should throw error if browser is not launched', () => {
			expect(() => getBrowserInstance()).toThrow('Browser instance is not available.');
		});
	});

	describe('closeBrowser', () => {
		it('should close the browser instance if it exists', async () => {
			const currentLogger = require('./lib/logger');
			await launchBrowser();
			await closeBrowser();

			expect(mockBrowser.close).toHaveBeenCalledTimes(1);
			expect(currentLogger.info).toHaveBeenCalledWith('Closing shared browser instance...');
			expect(currentLogger.info).toHaveBeenCalledWith(
				'Shared browser instance closed successfully.'
			);
			expect(() => getBrowserInstance()).toThrow();
		});

		it('should log if no browser instance exists to close', async () => {
			const currentLogger = require('./lib/logger');

			await closeBrowser();
			expect(currentLogger.info).toHaveBeenCalledWith('No active browser instance to close.');
			expect(mockBrowser.close).not.toHaveBeenCalled();
		});

		it('should log error if browser.close fails', async () => {
			const currentLogger = require('./lib/logger');
			const closeError = new Error('Close Failed');
			mockBrowser.close.mockRejectedValue(closeError);
			await launchBrowser();
			await closeBrowser();

			expect(mockBrowser.close).toHaveBeenCalledTimes(1);
			expect(currentLogger.error).toHaveBeenCalledWith(
				{ err: closeError },
				'Error closing shared browser instance.'
			);
		});
	});
});
