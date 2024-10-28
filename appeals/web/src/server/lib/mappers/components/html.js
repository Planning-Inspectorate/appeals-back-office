/**
 * @param {string} markupString
 * @returns {PageComponent}
 */
export const simpleHtmlComponent = (markupString) => ({
	type: 'html',
	parameters: {
		html: markupString
	}
});
