import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { textSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapAppellantStatementDueDate = ({
	appealDetails,
	currentRoute,
	userHasUpdateCasePermission
}) =>
	textSummaryListItem({
		id: 'appellant-statement-due-date',
		text: 'Appellant statement due',
		value: dateISOStringToDisplayDate(appealDetails.appealTimetable?.appellantStatementDueDate),
		link: `${currentRoute}/appeal-timetables/appellant-statement`,
		editable: Boolean(userHasUpdateCasePermission && appealDetails.startedAt),
		classes: 'appellant-statement-due-date',
		actionText: appealDetails.appealTimetable?.appellantStatementDueDate ? 'Change' : 'Schedule'
	});
