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
export const highlightRedactedSections = (redactedString, originalString) => {
	let result = '';
	let inMarkTag = false;
	let markContent = '';

	for (let i = 0; i < redactedString.length; i++) {
		if (redactedString[i] === '█') {
			if (!inMarkTag) {
				inMarkTag = true;
				markContent = originalString[i];
			} else {
				markContent += originalString[i];
			}
		} else {
			if (inMarkTag) {
				result += `<mark>${markContent}</mark>`;
				inMarkTag = false;
				markContent = '';
			}
			result += redactedString[i];
		}
	}

	// Close any remaining open <mark> tag
	if (inMarkTag) {
		result += `<mark>${markContent}</mark>`;
	}

	return result;
};
