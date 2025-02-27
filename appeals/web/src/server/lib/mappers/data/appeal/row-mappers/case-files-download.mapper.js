/**
 * @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} WebAppeal
 */

import { textHtmlItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').RowMapper} */
export const mapDownloadCaseFiles = ({ appealDetails }) => {
	const zipFileName = createZipFileName(appealDetails.appealReference);
	const html = `<a class="govuk-link" href="/documents/${appealDetails.appealId}/bulk-download/${zipFileName}">Download case</a>`;
	return textHtmlItem({
		id: 'download-case-files',
		wrapperHtml: {
			opening: '<div class="govuk-grid-row"><div class="govuk-grid-column-full">',
			closing: '</div></div>'
		},
		value: html
	});
};

/**
 *
 * @param {string} reference
 * @returns {string}
 */
const createZipFileName = (reference) => {
	const zipFileName = `case-${reference}.zip`;
	return zipFileName;
};
