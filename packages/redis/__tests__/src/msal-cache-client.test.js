//@ts-nocheck
import { jest } from '@jest/globals';
import { MSALCacheClient } from '../../src/msal-cache-client.js';

describe('MSALCacheClient', () => {
	it('returns redis value from get', async () => {
		const redisClient = {
			get: jest.fn().mockResolvedValue('cached-value')
		};
		const client = new MSALCacheClient(redisClient);

		await expect(client.get('cache:key')).resolves.toBe('cached-value');
		expect(redisClient.get).toHaveBeenCalledWith('cache:key');
	});

	it('returns empty string when get resolves undefined', async () => {
		const redisClient = {
			get: jest.fn().mockResolvedValue(undefined)
		};
		const client = new MSALCacheClient(redisClient);

		await expect(client.get('cache:key')).resolves.toBe('');
	});

	it('returns redis value from set', async () => {
		const redisClient = {
			set: jest.fn().mockResolvedValue('ok')
		};
		const client = new MSALCacheClient(redisClient);

		await expect(client.set('cache:key', 'value')).resolves.toBe('ok');
		expect(redisClient.set).toHaveBeenCalledWith('cache:key', 'value');
	});

	it('returns empty string when set resolves undefined', async () => {
		const redisClient = {
			set: jest.fn().mockResolvedValue(undefined)
		};
		const client = new MSALCacheClient(redisClient);

		await expect(client.set('cache:key', 'value')).resolves.toBe('');
	});
});
