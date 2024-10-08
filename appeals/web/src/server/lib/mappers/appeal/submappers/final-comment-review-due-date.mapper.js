import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { textSummaryListItem } from '#lib/mappers/components/text.js';

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapFinalCommentReviewDueDate = ({
	appealDetails,
	currentRoute,
	userHasUpdateCasePermission
}) =>
	textSummaryListItem({
		id: 'final-comment-review-due-date',
		text: 'Final comment review due',
		value:
			dateISOStringToDisplayDate(appealDetails.appealTimetable?.finalCommentReviewDate) ||
			'Due date not yet set',
		link: `${currentRoute}/appeal-timetables/final-comment-review`,
		userHasEditPermission: userHasUpdateCasePermission,
		classes: 'appeal-final-comment-review-due-date',
		actionText: appealDetails.appealTimetable?.finalCommentReviewDate ? 'Change' : 'Schedule'
	});
