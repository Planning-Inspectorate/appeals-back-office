const http = require('http');
const config = require('./config');
const logger = require('./lib/logger');
const app = require('./app');

const {
	server: { port }
} = config;

/**
 * @returns {http.Server}
 */
module.exports = () => {
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
