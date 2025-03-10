import { dateISOStringToDisplayDate } from '#lib/dates.js';
import * as displayPageFormatter from '#lib/display-page-formatter.js';
import { documentationFolderTableItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapLpaQuestionnaire = ({ appealDetails, currentRoute }) =>
	documentationFolderTableItem({
		id: 'lpa-questionnaire',
		text: 'LPA questionnaire',
		statusText: displayPageFormatter.mapDocumentStatus(
			appealDetails?.documentationSummary?.lpaQuestionnaire?.status,
			appealDetails?.documentationSummary?.lpaQuestionnaire?.dueDate
		),
		receivedText: dateISOStringToDisplayDate(
			appealDetails?.documentationSummary?.lpaQuestionnaire?.receivedAt
		),
		actionHtml:
			appealDetails?.documentationSummary?.lpaQuestionnaire?.status !== 'not_received'
				? `<a href="${currentRoute}/lpa-questionnaire/${appealDetails?.lpaQuestionnaireId}" data-cy="review-lpa-questionnaire" class="govuk-link">Review <span class="govuk-visually-hidden">L P A questionnaire</span></a>`
				: ''
	});
