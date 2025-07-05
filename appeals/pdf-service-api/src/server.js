import http from 'http';
import config from './config.js';
import logger from './lib/logger.js';
import app from './app.js';

const {
	server: { port }
} = config;

/**
 * @returns {http.Server}
 */
export default () => {
	const server = http.createServer(app);

	server.listen(port, () => {
		logger.info({ port, pid: process.pid }, 'PDF Service listening');
	});

	server.on('error', (error) => {
		logger.fatal({ err: error, port }, 'Server failed to start or encountered an error');
		process.exit(1);
	});

	return server;
};
