const http = require('http');

const config = require('./config');
const logger = require('./lib/logger');
const app = require('./app');

const {
	server: { port }
} = config;

module.exports = () => {
	const server = http.createServer(app);

	server.listen(port, () => {
		logger.info({ config }, 'Listening');
	});
};
