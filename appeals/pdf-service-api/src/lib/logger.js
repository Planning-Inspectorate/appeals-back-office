const { pino } = require('pino');
const config = require('../config');

const logger = pino({
	level: config.logger.level
});

module.exports = logger;
