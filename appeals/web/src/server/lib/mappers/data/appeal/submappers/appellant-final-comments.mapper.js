import { mapDocumentStatus } from '#lib/display-page-formatter.js';
import { documentationFolderTableItem } from '#lib/mappers/index.js';
import { dateISOStringToDisplayDate } from '#lib/dates.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapAppellantFinalComments = ({ appealDetails, currentRoute }) =>
	documentationFolderTableItem({
		id: 'appellant-final-comments',
		text: 'Appellant final comments',
		statusText: mapDocumentStatus(
			appealDetails?.documentationSummary?.appellantFinalComments?.status
		),
		receivedText: dateISOStringToDisplayDate(
			appealDetails?.documentationSummary?.appellantFinalComments?.receivedAt
		),
		actionHtml:
			appealDetails?.documentationSummary?.appellantFinalComments?.status === 'received'
				? `<a href="${currentRoute}/appellant-final-comment" data-cy="review-appellant-final-comments" class="govuk-link">Review <span class="govuk-visually-hidden">appellant final comments</span></a>`
				: ''
	});
