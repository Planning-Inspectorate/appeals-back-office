import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { textSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapLpaQuestionnaireDueDate = ({
	appealDetails,
	currentRoute,
	userHasUpdateCasePermission
}) =>
	textSummaryListItem({
		id: 'lpa-questionnaire-due-date',
		text: 'LPA questionnaire due',
		value: dateISOStringToDisplayDate(appealDetails.appealTimetable?.lpaQuestionnaireDueDate),
		link: `${currentRoute}/appeal-timetables/lpa-questionnaire`,
		editable: Boolean(userHasUpdateCasePermission && appealDetails.validAt),
		classes: 'appeal-lpa-questionnaire-due-date'
	});
