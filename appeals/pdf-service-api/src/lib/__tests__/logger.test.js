// @ts-nocheck
import { jest } from '@jest/globals';
import logger from '../logger.js';
import config from '../../config.js';

jest.mock('pino', () => ({
	pino: jest.fn().mockReturnValue({
		info: jest.fn()
	})
}));

// eslint-disable-next-line jest/no-disabled-tests
describe.skip('lib/logger', () => {
	it('should call pino with the correct params', async () => {
		const { pino } = await import('pino');
		logger.info('Generating pdf');

		expect(pino).toHaveBeenCalledTimes(1);
		expect(pino).toHaveBeenCalledWith({
			level: config.logger.level
		});
	});
});
