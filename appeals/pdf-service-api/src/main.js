import { closeBrowser, launchBrowser } from './browser-instance.js';
import logger from './lib/logger.js';
import server from './server.js';

const main = async () => {
	try {
		await launchBrowser();
		const httpServer = server();
		const signals = ['SIGINT', 'SIGTERM'];

		signals.forEach((signal) => {
			process.on(signal, async () => {
				logger.info(`Received ${signal}, shutting down gracefully...`);

				// @ts-ignore
				httpServer.close(async (err) => {
					if (err) {
						logger.error({ err }, 'Error closing HTTP server');
						process.exit(1);
					} else {
						logger.info('HTTP server closed.');
					}

					await closeBrowser();

					logger.info('Shutdown complete.');
					process.exit(0);
				});

				setTimeout(() => {
					logger.warn('Graceful shutdown timed out, forcing exit.');
					process.exit(1);
				}, 10000);
			});
		});
	} catch (err) {
		logger.fatal({ err }, 'Application failed to start.');
		process.exit(1);
	}
};

main();
