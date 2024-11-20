/**
 * @returns {boolean}
 */
export const randomBool = () => Math.random() < 0.5;

/**
 * Returns a value at random from the supplied enum object
 * @param {Object<any, string>} enumObject
 * @param {boolean} [includeNull]
 * @returns {string|null}
 */
export function randomEnumValue(enumObject, includeNull = true) {
	const values = Object.values(enumObject);

	if (includeNull) {
		values.push(null);
	}

	return values[Math.floor(Math.random() * values.length)];
}

/**
 * Returns a value at random from the supplied array
 * @param {any[]} arr
 * @returns {any}
 */
export function randomArrayValue(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}
