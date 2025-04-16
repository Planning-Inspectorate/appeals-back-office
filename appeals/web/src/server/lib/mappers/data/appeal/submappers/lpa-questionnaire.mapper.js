import {
	dateISOStringToDisplayDate,
	dateISOStringToDayMonthYearHourMinute,
	dateIsInThePast
} from '#lib/dates.js';
import { documentationFolderTableItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapLpaQuestionnaire = ({ appealDetails, currentRoute }) => {
	const { status } = appealDetails.documentationSummary?.lpaQuestionnaire ?? {};

	const statusText = (() => {
		if (!appealDetails.startedAt) {
			return 'Awaiting start date';
		}

		const afterDueDate =
			appealDetails.appealTimetable?.lpaQuestionnaireDueDate &&
			dateIsInThePast(
				dateISOStringToDayMonthYearHourMinute(appealDetails.appealTimetable.lpaQuestionnaireDueDate)
			);

		switch (status?.toLowerCase()) {
			case 'not_received':
				return afterDueDate ? 'Overdue' : 'Awaiting questionnaire';
			case 'received':
				return 'Ready to review';
			case 'complete':
				return 'Complete';
			case 'incomplete':
				return afterDueDate ? 'Overdue' : 'Incomplete';
			case 'published':
				return 'Shared';
			default:
				return '';
		}
	})();

	const actionHtml = (() => {
		switch (status) {
			case 'received':
				return `<a href="${currentRoute}/lpa-questionnaire/${appealDetails?.lpaQuestionnaireId}" data-cy="review-lpa-questionnaire" class="govuk-link">Review<span class="govuk-visually-hidden"> L P A questionnaire</span></a>`;
			case 'Complete':
				return `<a href="${currentRoute}/lpa-questionnaire/${appealDetails?.lpaQuestionnaireId}" data-cy="review-lpa-questionnaire" class="govuk-link">View<span class="govuk-visually-hidden"> L P A questionnaire</span></a>`;
			default:
				return '';
		}
	})();

	const receivedText = (() => {
		if (!appealDetails.startedAt) {
			return 'Not applicable';
		}

		if (appealDetails.documentationSummary?.lpaQuestionnaire?.status === 'not_received') {
			return `Due by ${dateISOStringToDisplayDate(
				appealDetails.appealTimetable?.lpaQuestionnaireDueDate
			)}`;
		}

		return dateISOStringToDisplayDate(
			appealDetails.documentationSummary?.lpaQuestionnaire?.receivedAt
		);
	})();

	return documentationFolderTableItem({
		id: 'lpa-questionnaire',
		text: 'LPA questionnaire',
		statusText,
		receivedText,
		actionHtml
	});
};
