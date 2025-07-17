/**
 *
 * @param {string} inputValue
 * @param {string} fallBackText
 * @returns {string}
 */
export function formatSentenceCase(inputValue, fallBackText = 'Not answered') {
	if (!inputValue) {
		return fallBackText;
	}
	const withSpaces = inputValue.replaceAll('-', ' ').replaceAll('_', ' ').replaceAll('  ', ' ');
	return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
}
