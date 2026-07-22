import { DistributedCachePlugin } from '@azure/msal-node';
import { parseRedisConnectionString } from '@pins/platform';
//@ts-ignore
import { RedisStore } from 'connect-redis';
import { createClient } from 'redis';
import { MSALCacheClient } from './msal-cache-client.js';
import { PartitionManager } from './partition-manager.js';

export class RedisClient {
	/**
     @param {string} connString - Redis connection string
     @param {import('./types').Logger} logger
     @param {string[]} [invalidateKeys]
   **/
	constructor(connString, logger, invalidateKeys = []) {
		this.logger = logger;

		const redisParams = parseRedisConnectionString(connString);

		this.client = createClient({
			socket: {
				host: redisParams.host,
				port: redisParams.port,
				tls: redisParams.ssl
			},
			password: redisParams.password,
			pingInterval: redisParams.pingInterval
		});

		/** @param {Error} err */
		const onError = (err) =>
			logger.error(`Could not establish a connection with redis server: ${err}`);

		this.client.on('connect', () => logger.info('Initiating connection to redis server...'));
		this.client.on('ready', async () => {
			logger.info('Connected to redis server successfully...');
			await Promise.allSettled(invalidateKeys.map((key) => this.invalidate(key)));
		});
		this.client.on('end', () => logger.info('Disconnected from redis server...'));
		this.client.on('error', onError);
		this.client.on('reconnecting', () => logger.info('Reconnecting to redis server...'));

		// kick off the connection - no await here, in the background
		this.client.connect().catch(onError);

		// dev note: this may 'error' in vscode, but tscheck is all OK
		//@ts-ignore
		this.store = new RedisStore({ client: this.client });

		this.clientWrapper = new MSALCacheClient(this.client);
	}

	/**
	 * @param {string} sessionId
	 * @returns {import('@azure/msal-node').DistributedCachePlugin}
	 * */
	makeCachePlugin(sessionId) {
		const partitionManager = new PartitionManager(this.clientWrapper, sessionId, this.logger);
		return new DistributedCachePlugin(
			this.clientWrapper,
			/** @type {import('@azure/msal-node').IPartitionManager} */ (partitionManager)
		);
	}

	/**
	 * @template T
	 * @param {string} loggingName
	 * @param {string} cacheKey
	 * @param {number} cacheTimeInSeconds
	 * @param {function(): Promise<T>} fetchDataCallback
	 * @returns {Promise<T>}
	 */
	async getOrSet(loggingName, cacheKey, cacheTimeInSeconds, fetchDataCallback) {
		try {
			const cachedData = await this.client.get(cacheKey);
			if (cachedData) {
				return JSON.parse(cachedData);
			}
		} catch (err) {
			this.logger.error(err, `Error retrieving ${loggingName} data from Redis:`);
		}

		const data = await fetchDataCallback();

		this.client.set(cacheKey, JSON.stringify(data), { EX: cacheTimeInSeconds }).catch((err) => {
			this.logger.error(err, `Error caching ${loggingName} data in Redis:`);
		});

		return data;
	}

	/**
	 * @param {string} cacheKey
	 */
	async invalidate(cacheKey) {
		const result = await this.client.del(cacheKey);

		if (result > 0) {
			this.logger.info(`Invalidated cache for key: ${cacheKey}`);
		}
	}
}
