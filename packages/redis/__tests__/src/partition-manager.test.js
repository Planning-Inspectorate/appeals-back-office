//@ts-nocheck
import { jest } from '@jest/globals';
import { PartitionManager } from '../../src/partition-manager.js';

describe('PartitionManager', () => {
	const logger = {
		error: jest.fn()
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('returns homeAccountId from session data', async () => {
		const redisClient = {
			get: jest.fn().mockResolvedValue(JSON.stringify({ account: { homeAccountId: 'home-123' } }))
		};
		const manager = new PartitionManager(redisClient, 'session-123', logger);

		await expect(manager.getKey()).resolves.toBe('home-123');
		expect(redisClient.get).toHaveBeenCalledWith('sess:session-123');
	});

	it('returns empty string when session data has no homeAccountId', async () => {
		const redisClient = {
			get: jest.fn().mockResolvedValue(JSON.stringify({ account: {} }))
		};
		const manager = new PartitionManager(redisClient, 'session-123', logger);

		await expect(manager.getKey()).resolves.toBe('');
	});

	it('logs and returns empty string when getKey fails', async () => {
		const error = { msg: 'boom' };
		const redisClient = {
			get: jest.fn().mockRejectedValue(error)
		};
		const manager = new PartitionManager(redisClient, 'session-123', logger);

		await expect(manager.getKey()).resolves.toBe('');
		expect(logger.error).toHaveBeenCalledWith('boom');
	});

	it('returns homeAccountId from extractKey', async () => {
		const manager = new PartitionManager({}, 'session-123', logger);

		await expect(manager.extractKey({ homeAccountId: 'home-123' })).resolves.toBe('home-123');
	});

	it('throws when extractKey has no homeAccountId', async () => {
		const manager = new PartitionManager({}, 'session-123', logger);

		await expect(manager.extractKey({})).rejects.toThrow('homeAccountId not found');
	});
});
