import { dateISOStringToDisplayDate } from '#lib/dates.js';
import * as displayPageFormatter from '#lib/display-page-formatter.js';

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapLpaQuestionnaire = ({ appealDetails, currentRoute }) => ({
	id: 'lpa-questionnaire',
	display: {
		tableItem: [
			{
				text: 'LPA questionnaire'
			},
			{
				text: displayPageFormatter.mapDocumentStatus(
					appealDetails?.documentationSummary?.lpaQuestionnaire?.status
				)
			},
			{
				text: dateISOStringToDisplayDate(
					appealDetails?.documentationSummary?.lpaQuestionnaire?.receivedAt
				)
			},
			{
				html:
					appealDetails?.documentationSummary?.lpaQuestionnaire?.status !== 'not_received'
						? `<a href="${currentRoute}/lpa-questionnaire/${appealDetails?.lpaQuestionnaireId}" data-cy="review-lpa-questionnaire" class="govuk-link">Review <span class="govuk-visually-hidden">L P A questionnaire</span></a>`
						: ''
			}
		]
	}
});
