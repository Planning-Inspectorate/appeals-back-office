/**
 * @param {string|null|undefined} str
 * @returns {boolean}
 */
export function stringIsValidPostcodeFormat(str) {
	if (str !== null && str !== undefined) {
		const regex = /^([A-Za-z]{1,2}\d[A-Za-z\d]? ?\d[A-Za-z]{2}|GIR ?0A{2})$/gm;
		const result = str.match(regex);

		return Array.isArray(result) && result.length > 0;
	}

	return false;
}
