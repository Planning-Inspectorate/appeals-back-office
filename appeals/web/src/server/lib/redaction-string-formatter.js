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

/**
 * @param {string} redactedString
 * @param {string} originalString
 * @returns {string}
 */
export function highlightRedactedSections(redactedString, originalString) {
	return redactedString
		.split('')
		.map((char, index) => (char === '█' ? `<mark>${originalString[index]}</mark>` : char))
		.join('');
}
