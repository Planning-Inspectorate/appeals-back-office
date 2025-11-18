import crypto from 'crypto';
import NodeCache from 'node-cache';

export const nodeCache = new NodeCache();

export const setCache = (
	/** @type {NodeCache.Key} */ key,
	/** @type {Record<string,any>[]} */ value,
	/** @type {number|undefined} */ ttl = 3600
) => {
	nodeCache.set(key, value, ttl);
};

export const getCache = (/** @type {NodeCache.Key} */ key) => {
	return nodeCache.get(key);
};

/**
 * @param {Object} uniqueObject
 * @returns {string}
 */
export const getUniqueCacheKey = (uniqueObject) => {
	const json = JSON.stringify(uniqueObject, Object.keys(uniqueObject).sort());
	return crypto.createHash('sha256').update(json).digest('hex');
};
