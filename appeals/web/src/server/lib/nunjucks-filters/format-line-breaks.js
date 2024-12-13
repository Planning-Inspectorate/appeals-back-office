/**
 * Replaces carriage return line break with br tags
 *
 * @param {string} text
 * @returns {string}
 */
export const formatLineBreaks = (text) => {
	return text.replace(/\n/g, '<br>').replace(/\r/g, '');
};
