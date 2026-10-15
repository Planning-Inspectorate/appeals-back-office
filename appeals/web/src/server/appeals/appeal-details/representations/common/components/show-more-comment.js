import { newLine2LineBreak } from '#lib/string-utilities.js';

/**
 * The containing page must call preRenderPageComponents.
 * @param {{ text?: string, html?: string}} params
 * @returns {HtmlProperty}
 */
export const showMoreComment = ({ text, html }) => ({
	html: '',
	pageComponents: [
		{
			type: 'show-more',
			parameters: {
				html: html ?? newLine2LineBreak(text)
			}
		}
	]
});
