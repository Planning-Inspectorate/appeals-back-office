import { mapDocumentStatus } from '#lib/display-page-formatter.js';
import { documentationFolderTableItem } from '#lib/mappers/index.js';
import { dateISOStringToDisplayDate } from '#lib/dates.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapLPAFinalComments = ({ appealDetails, currentRoute }) =>
	documentationFolderTableItem({
		id: 'lpa-final-comments',
		text: 'LPA final comments',
		statusText: mapDocumentStatus(appealDetails?.documentationSummary?.lpaFinalComments?.status),
		receivedText: dateISOStringToDisplayDate(
			appealDetails?.documentationSummary?.lpaFinalComments?.receivedAt
		),
		actionHtml:
			appealDetails?.documentationSummary?.lpaFinalComments?.status === 'received'
				? `<a href="${currentRoute}/final-comments/lpa" data-cy="review-lpa-final-comments" class="govuk-link">Review <span class="govuk-visually-hidden">L P A final comments</span></a>`
				: ''
	});
