import { prettyPrint } from 'html';
import htmlParser from 'node-html-parser';

/**
 * Parses HTML and returns a root element.
 *
 * @param {string} html
 * @param {Partial<import('node-html-parser').Options> & { rootElement?: string; skipPrettyPrint?: boolean }} [options={}]
 * @returns {HTMLElement}
 */
export const parseHtml = (
	html,
	{ rootElement = 'main', skipPrettyPrint = false, ...options } = {}
) => {
	let parsedHtml = /** @type {*} */ (htmlParser)
		.parse(html)
		.removeWhitespace()
		.querySelector(rootElement)
		.toString();

	if (!skipPrettyPrint) {
		parsedHtml = prettyPrint(parsedHtml);
	}

	return /** @type {*} */ (htmlParser).parse(parsedHtml, options);
};
