import config from '#config/config.js';
import logger from '#utils/logger.js';
import { RedisClient } from '@pins/redis';

/**
 * @returns {RedisClient | null}
 * */
function initClient() {
	if (!config.redisConnectionString || config.disableRedis) {
		logger.info('Redis client is disabled or not configured');
		return null;
	}

	return new RedisClient(config.redisConnectionString, logger);
}

export default initClient();
