import { preRenderPageComponents } from '#lib/nunjucks-template-builders/page-component-rendering.js';

/**
 * @param {string} backLinkUrl
 * @returns {PageContent}
 */
export function errorFileTypesDoNotMatchPage(backLinkUrl) {
	/** @type {PageContent} */
	const pageContent = {
		title: 'There is a problem',
		backLinkText: 'Back',
		backLinkUrl,
		heading: `There is a problem`,
		pageComponents: [
			{
				type: 'html',
				parameters: {
					html: '<p class="govuk-body">We could not upload one of the files.</p><p class="govuk-body">The file name does not match the file type.</p><p class="govuk-body">You need to upload a file with a name that matches the file type.</p>'
				}
			}
		]
	};

	if (pageContent.pageComponents) {
		preRenderPageComponents(pageContent.pageComponents);
	}

	return pageContent;
}
