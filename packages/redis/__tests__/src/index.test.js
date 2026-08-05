//@ts-nocheck
import { jest } from '@jest/globals';

const parseRedisConnectionString = jest.fn();
const createClient = jest.fn();
const RedisStore = jest.fn();
const MSALCacheClient = jest.fn();
const PartitionManager = jest.fn();
const DistributedCachePlugin = jest.fn();

await jest.unstable_mockModule('@azure/msal-node', () => ({
	DistributedCachePlugin
}));

await jest.unstable_mockModule('@pins/platform', () => ({
	parseRedisConnectionString
}));

await jest.unstable_mockModule('connect-redis', () => ({
	RedisStore
}));

await jest.unstable_mockModule('redis', () => ({
	createClient
}));

await jest.unstable_mockModule('../../src/msal-cache-client.js', () => ({
	MSALCacheClient
}));

await jest.unstable_mockModule('../../src/partition-manager.js', () => ({
	PartitionManager
}));

const { RedisClient } = await import('../../src/index.js');

describe('RedisClient', () => {
	let logger;
	let redisClient;

	const setupClient = () => {
		redisClient = {
			on: jest.fn(),
			connect: jest.fn().mockResolvedValue(undefined),
			get: jest.fn(),
			set: jest.fn().mockResolvedValue(undefined)
		};

		createClient.mockReturnValue(redisClient);
		parseRedisConnectionString.mockReturnValue({
			host: 'redis.example',
			port: 6380,
			ssl: true,
			password: 'secret',
			pingInterval: 30000
		});

		logger = {
			info: jest.fn(),
			error: jest.fn()
		};
	};

	beforeEach(() => {
		jest.clearAllMocks();
		setupClient();
	});

	describe('constructor', () => {
		it('creates redis client instance', () => {
			const client = new RedisClient('redis://example', logger);
			const handlers = Object.fromEntries(
				redisClient.on.mock.calls.map(([eventName, handler]) => [eventName, handler])
			);

			expect(parseRedisConnectionString).toHaveBeenCalledWith('redis://example');
			expect(createClient).toHaveBeenCalledWith({
				socket: {
					host: 'redis.example',
					port: 6380,
					tls: true
				},
				password: 'secret',
				pingInterval: 30000
			});
			expect(redisClient.on).toHaveBeenCalledWith('connect', expect.any(Function));
			expect(redisClient.on).toHaveBeenCalledWith('ready', expect.any(Function));
			expect(redisClient.on).toHaveBeenCalledWith('end', expect.any(Function));
			expect(redisClient.on).toHaveBeenCalledWith('error', expect.any(Function));
			expect(redisClient.on).toHaveBeenCalledWith('reconnecting', expect.any(Function));
			expect(redisClient.connect).toHaveBeenCalledTimes(1);
			expect(RedisStore).toHaveBeenCalledWith({ client: redisClient });
			expect(MSALCacheClient).toHaveBeenCalledWith(redisClient);
			handlers.connect();
			handlers.ready();
			handlers.end();
			handlers.reconnecting();
			expect(logger.info).toHaveBeenCalledWith('Initiating connection to redis server...');
			expect(logger.info).toHaveBeenCalledWith('Connected to redis server successfully...');
			expect(logger.info).toHaveBeenCalledWith('Disconnected from redis server...');
			expect(logger.info).toHaveBeenCalledWith('Reconnecting to redis server...');
			expect(client.store).toBeDefined();
			expect(client.clientWrapper).toBeDefined();
		});

		it('logs when redis connection fails', async () => {
			const error = new Error('connection failed');
			redisClient.connect.mockRejectedValueOnce(error);

			new RedisClient('redis://example', logger);

			await new Promise((resolve) => setImmediate(resolve));

			expect(logger.error).toHaveBeenCalledWith(
				`Could not establish a connection with redis server: ${error}`
			);
		});
	});

	describe('getOrSet', () => {
		it('returns cached data without fetching', async () => {
			const client = new RedisClient('redis://example', logger);
			redisClient.get.mockResolvedValue(JSON.stringify({ answer: 42 }));
			const fetchDataCallback = jest.fn();

			const result = await client.getOrSet('answers', 'cache:key', 60, fetchDataCallback);

			expect(result).toEqual({ answer: 42 });
			expect(redisClient.get).toHaveBeenCalledWith('cache:key');
			expect(fetchDataCallback).not.toHaveBeenCalled();
			expect(redisClient.set).not.toHaveBeenCalled();
		});

		it('fetches data and caches it on a miss', async () => {
			const client = new RedisClient('redis://example', logger);
			redisClient.get.mockResolvedValue(null);
			const payload = { answer: 42 };
			const fetchDataCallback = jest.fn().mockResolvedValue(payload);

			const result = await client.getOrSet('answers', 'cache:key', 60, fetchDataCallback);

			expect(result).toBe(payload);
			expect(fetchDataCallback).toHaveBeenCalledTimes(1);
			expect(redisClient.set).toHaveBeenCalledWith('cache:key', JSON.stringify(payload), {
				EX: 60
			});
		});

		it('logs when cache write fails', async () => {
			const client = new RedisClient('redis://example', logger);
			redisClient.get.mockResolvedValue(null);
			const error = new Error('cache write failed');
			const payload = { answer: 42 };
			const fetchDataCallback = jest.fn().mockResolvedValue(payload);
			redisClient.set.mockRejectedValueOnce(error);

			const result = await client.getOrSet('answers', 'cache:key', 60, fetchDataCallback);

			expect(result).toBe(payload);
			await new Promise((resolve) => setImmediate(resolve));
			expect(logger.error).toHaveBeenCalledWith(error, 'Error caching answers data in Redis:');
		});

		it('logs and recovers when cache lookup fails', async () => {
			const client = new RedisClient('redis://example', logger);
			const error = new Error('redis unavailable');
			redisClient.get.mockRejectedValue(error);
			const payload = { answer: 42 };
			const fetchDataCallback = jest.fn().mockResolvedValue(payload);

			const result = await client.getOrSet('answers', 'cache:key', 60, fetchDataCallback);

			expect(result).toBe(payload);
			expect(logger.error).toHaveBeenCalledWith(error, 'Error retrieving answers data from Redis:');
			expect(fetchDataCallback).toHaveBeenCalledTimes(1);
			expect(redisClient.set).toHaveBeenCalledWith('cache:key', JSON.stringify(payload), {
				EX: 60
			});
		});
	});

	describe('makeCachePlugin', () => {
		it('builds a distributed cache plugin', () => {
			const client = new RedisClient('redis://example', logger);
			const plugin = client.makeCachePlugin('session-123');

			expect(PartitionManager).toHaveBeenCalledWith(client.clientWrapper, 'session-123', logger);
			expect(DistributedCachePlugin).toHaveBeenCalledWith(client.clientWrapper, expect.any(Object));
			expect(plugin).toBeDefined();
		});
	});
});
