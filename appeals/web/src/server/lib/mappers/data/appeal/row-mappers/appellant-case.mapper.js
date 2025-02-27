import { dateISOStringToDisplayDate } from '#lib/dates.js';
import * as displayPageFormatter from '#lib/display-page-formatter.js';
import { documentationFolderTableItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').RowMapper} */
export const mapAppellantCase = ({ appealDetails, currentRoute }) =>
	documentationFolderTableItem({
		id: 'appellant-case',
		text: 'Appellant case',
		statusText: displayPageFormatter.mapDocumentStatus(
			appealDetails?.documentationSummary?.appellantCase?.status,
			appealDetails?.documentationSummary?.appellantCase?.dueDate
		),
		receivedText: dateISOStringToDisplayDate(
			appealDetails?.documentationSummary?.appellantCase?.receivedAt
		),
		actionHtml:
			appealDetails?.documentationSummary?.appellantCase?.status !== 'not_received'
				? `<a href="${currentRoute}/appellant-case" data-cy="review-appellant-case" class="govuk-link">Review <span class="govuk-visually-hidden">appellant case</span></a>`
				: ''
	});
