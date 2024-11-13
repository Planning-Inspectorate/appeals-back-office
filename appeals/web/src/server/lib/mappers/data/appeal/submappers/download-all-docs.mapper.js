/**
 * @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} WebAppeal
 */

import { textSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapDownloadAllDocuments = ({ appealDetails }) =>
	textSummaryListItem({
		id: 'download-bulk-docs',
		text: 'Download all documents for this appeal',
		link: `/documents/${appealDetails.appealId}/bulk-download/appeal-${appealDetails.appealReference}.zip`,
		editable: true,
		actionText: 'Download'
	});
