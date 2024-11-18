/**
 * @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} WebAppeal
 */

import { textHtmlItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapDownloadCaseFiles = ({ appealDetails }) => {
	const zipFileName = createZipFileName(appealDetails.appealReference);
	const html = `<a class="govuk-link" href="/documents/${appealDetails.appealId}/bulk-download/${zipFileName}">Download case</a>`;
	return textHtmlItem({
		id: 'download-case-files',
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
