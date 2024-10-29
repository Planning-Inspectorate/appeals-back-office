import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { textSummaryListItem } from '#lib/mappers/components/text.js';

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapAppellantStatementDueDate = ({
	appealDetails,
	currentRoute,
	userHasUpdateCasePermission
}) =>
	textSummaryListItem({
		id: 'statement-review-due-date',
		text: 'Statement review due',
		value:
			dateISOStringToDisplayDate(appealDetails.appealTimetable?.appellantStatementDueDate) ||
			'Due date not yet set',
		link: `${currentRoute}/appeal-timetables/appellant-statement`,
		editable: userHasUpdateCasePermission,
		classes: 'appeal-statement-review-due-date',
		actionText: appealDetails.appealTimetable?.appellantStatementDueDate ? 'Change' : 'Schedule'
	});
