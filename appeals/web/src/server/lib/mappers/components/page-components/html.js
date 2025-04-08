/**
 * @param {string} tag
 * @param {Record<string, string>} [attrs]
 * @param {string} [content]
 * @returns {HtmlPageComponent}
 * */
export const simpleHtmlComponent = (tag, attrs = {}, content) => {
	const attrsItems = Object.entries(attrs).map(([key, value]) => `${key}="${value}"`);

	const attrsString = attrsItems.length > 0 ? ' ' + attrsItems.join(' ') : '';

	const html = content ? `<${tag}${attrsString}>${content}</${tag}>` : `<${tag}${attrsString}>`;

	return {
		type: 'html',
		parameters: { html }
	};
};

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
