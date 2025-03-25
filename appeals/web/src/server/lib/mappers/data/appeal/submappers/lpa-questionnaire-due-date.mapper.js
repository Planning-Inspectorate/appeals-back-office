import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { textSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapLpaQuestionnaireDueDate = ({
	appealDetails,
	currentRoute,
	userHasUpdateCasePermission
}) => {
	const id = 'lpa-questionnaire-due-date';
	if (!appealDetails.startedAt) {
		return { id, display: {} };
	}
	return textSummaryListItem({
		id,
		text: 'LPA questionnaire due',
		value: dateISOStringToDisplayDate(appealDetails.appealTimetable?.lpaQuestionnaireDueDate),
		link: `${currentRoute}/appeal-timetables/lpa-questionnaire`,
		editable: Boolean(userHasUpdateCasePermission && appealDetails.validAt),
		classes: 'appeal-lpa-questionnaire-due-date'
	});
};
