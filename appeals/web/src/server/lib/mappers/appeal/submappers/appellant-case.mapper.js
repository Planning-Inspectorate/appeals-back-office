import { dateToDisplayDate } from '#lib/dates.js';
import * as displayPageFormatter from '#lib/display-page-formatter.js';

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapAppellantCase = ({ appealDetails, currentRoute }) => ({
	id: 'appellant-case',
	display: {
		tableItem: [
			{
				text: 'Appellant case'
			},
			{
				text: displayPageFormatter.mapDocumentStatus(
					appealDetails?.documentationSummary?.appellantCase?.status,
					appealDetails?.documentationSummary?.appellantCase?.dueDate
				)
			},
			{
				text: dateToDisplayDate(appealDetails?.documentationSummary?.appellantCase?.receivedAt)
			},
			{
				html:
					appealDetails?.documentationSummary?.appellantCase?.status !== 'not_received'
						? `<a href="${currentRoute}/appellant-case" data-cy="review-appellant-case" class="govuk-link">Review <span class="govuk-visually-hidden">appellant case</span></a>`
						: ''
			}
		]
	}
});
