import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { mapDocumentStatus } from '#lib/display-page-formatter.js';
import { documentationFolderTableItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapLpaStatement = ({ appealDetails, currentRoute }) => {
	return documentationFolderTableItem({
		id: 'lpa-statement',
		text: 'LPA statement',
		statusText: mapDocumentStatus(appealDetails?.documentationSummary?.lpaStatement?.status),
		receivedText: dateISOStringToDisplayDate(
			appealDetails?.documentationSummary?.lpaStatement?.receivedAt instanceof Date
				? appealDetails?.documentationSummary?.lpaStatement?.receivedAt.toDateString()
				: appealDetails?.documentationSummary?.lpaStatement?.receivedAt
		),
		actionHtml:
			appealDetails?.documentationSummary?.lpaStatement?.status === 'received'
				? `<a href="${currentRoute}/lpa-statement" data-cy="review-lpa-statement" class="govuk-link">Review<span class="govuk-visually-hidden">LPA statement</span></a>`
				: ''
	});
};
