import { mapDocumentStatus } from '#lib/display-page-formatter.js';
import { documentationFolderTableItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapIpComments = ({ appealDetails, currentRoute }) =>
	documentationFolderTableItem({
		id: 'ip-comments',
		text: 'Interested party comments',
		statusText: mapDocumentStatus(appealDetails?.documentationSummary?.ipComments?.status),
		receivedText: 'Not applicable',
		actionHtml: `<a href="${currentRoute}/interested-party-comments" data-cy="review-ip-comments" class="govuk-link">${
			appealDetails?.documentationSummary?.ipComments?.status === 'received' ? 'Review' : 'Add'
		} <span class="govuk-visually-hidden">Interested party comments</span></a>`
	});
