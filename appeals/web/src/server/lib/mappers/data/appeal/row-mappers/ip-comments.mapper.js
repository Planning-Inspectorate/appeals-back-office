import { mapDocumentStatus } from '#lib/display-page-formatter.js';
import { documentationFolderTableItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').RowMapper} */
export const mapIpComments = ({ appealDetails, currentRoute }) => {
	const actionText = (() => {
		const { status, counts } = appealDetails?.documentationSummary?.ipComments ?? {};

		if (status !== 'received') {
			return 'Add';
		}

		if (counts?.published === 0) {
			return 'Review';
		}

		return 'View';
	})();

	let status = appealDetails?.documentationSummary?.ipComments?.status;
	const published = appealDetails.documentationSummary?.ipComments?.counts?.published;

	if (status === 'received' && published && published > 0) {
		status = 'shared';
	}

	return documentationFolderTableItem({
		id: 'ip-comments',
		text: 'Interested party comments',
		statusText: mapDocumentStatus(status),
		receivedText: 'Not applicable',
		actionHtml: `<a href="${currentRoute}/interested-party-comments" data-cy="review-ip-comments" class="govuk-link">${actionText}<span class="govuk-visually-hidden"> interested party comments</span></a>`
	});
};
