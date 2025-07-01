// @ts-nocheck
import { textHtmlItem } from '#lib/mappers/index.js';

/**
 * @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} WebAppeal
 */

/**
 * Maps appeal details to a PageComponent for the "Download All PDFs" button.
 * This button will trigger a direct file download from the backend.
 *
 * @param {{ appealDetails: WebAppeal }} params
 * @returns {import('#lib/nunjucks-template-builders/page-component-rendering.js').PageComponent}
 */
export const mapDownloadAllPdfsButton = ({ appealDetails }) => {
	// Construct the URL for our download-all-generated-pdfs.router.js
	const downloadUrl = `/appeals-service/appeal-details/${appealDetails.appealId}/download-all-generated-pdfs`;

	// Create the HTML for the link. Using govuk-link to match the design request.
	const html = `<a class="govuk-link" href="${downloadUrl}" role="button" data-cy="download-all-generated-pdfs">Download all generated PDFs as ZIP</a>`;

	// Return the standard PageComponent structure
	return textHtmlItem({
		id: 'download-all-pdfs-button',
		wrapperHtml: {
			opening: '<p class="govuk-body">', // Use a simple paragraph wrapper
			closing: '</p>'
		},
		value: html
	});
};
