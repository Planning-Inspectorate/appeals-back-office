import config from '#config/config.js';
import logger from '#utils/logger.js';
import { RedisClient } from '@pins/redis';
import { validCacheLookupTables } from '../../lookup-table-names.js';

/**
 * @returns {RedisClient | null}
 * */
function initClient() {
	if (!config.redisConnectionString || config.disableRedis) {
		logger.info('Redis client is disabled or not configured');
		return null;
	}

	const cacheKeys = Array.from(validCacheLookupTables);
	return new RedisClient(config.redisConnectionString, logger, cacheKeys);
}

export default initClient();
