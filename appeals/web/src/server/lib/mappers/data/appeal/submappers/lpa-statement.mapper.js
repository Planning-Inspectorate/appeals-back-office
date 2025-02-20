import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { mapRepresentationDocumentSummaryStatus } from '#lib/representation-utilities.js';
import { documentationFolderTableItem } from '#lib/mappers/index.js';
import { APPEAL_REPRESENTATION_STATUS } from '@pins/appeals/constants/common.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapLpaStatement = ({ appealDetails, currentRoute }) =>
	documentationFolderTableItem({
		id: 'lpa-statement',
		text: 'LPA statement',
		statusText: mapRepresentationDocumentSummaryStatus(
			appealDetails?.documentationSummary?.lpaStatement?.status,
			appealDetails?.documentationSummary?.lpaStatement?.representationStatus
		),
		receivedText: dateISOStringToDisplayDate(
			appealDetails?.documentationSummary?.lpaStatement?.receivedAt instanceof Date
				? appealDetails?.documentationSummary?.lpaStatement?.receivedAt.toDateString()
				: appealDetails?.documentationSummary?.lpaStatement?.receivedAt
		),
		actionHtml: [
			APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW,
			APPEAL_REPRESENTATION_STATUS.INCOMPLETE
		].includes(appealDetails?.documentationSummary?.lpaStatement?.representationStatus ?? '')
			? `<a href="${currentRoute}/lpa-statement" data-cy="review-lpa-statement" class="govuk-link">Review<span class="govuk-visually-hidden">LPA statement</span></a>`
			: `<a href="${currentRoute}/lpa-statement" data-cy="view-lpa-statement" class="govuk-link">View<span class="govuk-visually-hidden">LPA statement</span></a>`
	});
