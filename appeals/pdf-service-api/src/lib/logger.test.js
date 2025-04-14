// @ts-nocheck
const { pino } = require('pino');
const logger = require('./logger');
const config = require('../config');

jest.mock('pino', () => ({
	pino: jest.fn().mockReturnValue({
		info: jest.fn()
	})
}));

describe('lib/logger', () => {
	it('should call pino with the correct params', () => {
		logger.info('Generating pdf');

		expect(pino).toHaveBeenCalledTimes(1);
		expect(pino).toHaveBeenCalledWith({
			level: config.logger.level
		});
	});
});
