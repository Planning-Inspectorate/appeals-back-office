import { getUniqueCacheKey } from '../cache-data.js';

describe('getUniqueCacheKey', () => {
	it('returns the same hash for objects with same properties in different orders', () => {
		const obj1 = { a: 1, b: 2 };
		const obj2 = { b: 2, a: 1 };
		expect(getUniqueCacheKey(obj1)).toBe(getUniqueCacheKey(obj2));
	});

	it('returns different hashes for objects with different values', () => {
		const obj1 = { a: 1, b: 2 };
		const obj2 = { a: 1, b: 3 };
		expect(getUniqueCacheKey(obj1)).not.toBe(getUniqueCacheKey(obj2));
	});

	it('returns different hashes for objects with different keys', () => {
		const obj1 = { a: 1, b: 2 };
		const obj2 = { a: 1, c: 2 };
		expect(getUniqueCacheKey(obj1)).not.toBe(getUniqueCacheKey(obj2));
	});

	it('handles nested objects and arrays', () => {
		const obj1 = { a: [1, 2, 3], b: { c: 4 } };
		const obj2 = { b: { c: 4 }, a: [1, 2, 3] };
		expect(getUniqueCacheKey(obj1)).toBe(getUniqueCacheKey(obj2));
	});

	it('returns different hashes for arrays with different orders', () => {
		const obj1 = { a: [1, 2, 3] };
		const obj2 = { a: [3, 2, 1] };
		expect(getUniqueCacheKey(obj1)).not.toBe(getUniqueCacheKey(obj2));
	});
});
