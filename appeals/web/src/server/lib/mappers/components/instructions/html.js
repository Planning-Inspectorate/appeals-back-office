import { simpleHtmlComponent } from '../page-components/html.js';

/**
 * @param {Object} options
 * @param {string} options.id
 * @param {string} [options.tag]
 * @param {Record<string, string>} [options.attrs]
 * @param {string} [options.content]
 * @returns {Instructions}
 * */
export const simpleHtml = ({ id, tag, attrs = {}, content }) => {
	return {
		id,
		display: {
			htmlItem: simpleHtmlComponent(tag || 'div', attrs || {}, content)
		}
	};
};
