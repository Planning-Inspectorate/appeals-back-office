import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { textSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapAppellantFinalCommentDueDate = ({
	appealDetails,
	currentRoute,
	userHasUpdateCasePermission
}) =>
	textSummaryListItem({
		id: 'appellant-final-comment-due-date',
		text: 'Appellant final comments due',
		value: dateISOStringToDisplayDate(appealDetails.appealTimetable?.appellantFinalCommentsDueDate),
		link: `${currentRoute}/appeal-timetables/appellant-final-comments`,
		editable: Boolean(userHasUpdateCasePermission && appealDetails.startedAt),
		classes: 'appeal-final-comments-due-date'
	});
