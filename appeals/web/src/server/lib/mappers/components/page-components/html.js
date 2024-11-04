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

/**
 * @param {PageComponent[]} pageComponents
 * @param {PageComponent['wrapperHtml']} wrapperHtml
 * @returns {PageComponent}
 */
export const wrapComponents = (pageComponents, wrapperHtml) => ({
	type: 'html',
	wrapperHtml,
	parameters: {
		html: '',
		pageComponents
	}
});
