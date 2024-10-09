import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { textSummaryListItem } from '#lib/mappers/components/text.js';

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapStatementReviewDueDate = ({
	appealDetails,
	currentRoute,
	userHasUpdateCasePermission
}) =>
	textSummaryListItem({
		id: 'statement-review-due-date',
		text: 'Statement review due',
		value:
			dateISOStringToDisplayDate(appealDetails.appealTimetable?.statementReviewDate) ||
			'Due date not yet set',
		link: `${currentRoute}/appeal-timetables/statement-review`,
		editable: userHasUpdateCasePermission,
		classes: 'appeal-statement-review-due-date',
		actionText: appealDetails.appealTimetable?.statementReviewDate ? 'Change' : 'Schedule'
	});
