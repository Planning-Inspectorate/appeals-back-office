import { kebabCase } from 'lodash-es';

/**
 * @param {Object} params
 * @param {string} params.summaryText
 * @param {string} params.html
 * @param {PageComponent['wrapperHtml']} [params.wrapperHtml]
 * @returns {PageComponent}
 */
export const detailsComponent = ({ summaryText, html, wrapperHtml }) => ({
	type: 'details',
	wrapperHtml: wrapperHtml || {
		opening: '<div class="govuk-grid-row"><div class="govuk-grid-column-full">',
		closing: '</div></div>'
	},
	parameters: {
		summaryText,
		html,
		attributes: {
			'data-cy': kebabCase(summaryText)
		}
	}
});
