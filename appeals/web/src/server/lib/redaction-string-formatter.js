/**
 * @param {string} redactedString
 * @returns {string}
 */
export function addInvisibleSpacesAfterRedactionCharacters(redactedString) {
	return redactedString
		.split('')
		.map((char) => (char === '█' ? `${char}\u200B` : char))
		.join('');
}
