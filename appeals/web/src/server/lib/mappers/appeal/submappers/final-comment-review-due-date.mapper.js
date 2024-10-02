import { dateISOStringToDisplayDate } from '#lib/dates.js';

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapFinalCommentReviewDueDate = ({ appealDetails, currentRoute }) => ({
	id: 'final-comment-review-due-date',
	display: {
		summaryListItem: {
			key: {
				text: 'Final comment review due'
			},
			value: {
				html:
					dateISOStringToDisplayDate(appealDetails.appealTimetable?.finalCommentReviewDate) ||
					'Due date not yet set'
			},
			actions: {
				items: [
					{
						text: appealDetails.appealTimetable?.finalCommentReviewDate ? 'Change' : 'Schedule',
						href: `${currentRoute}/appeal-timetables/final-comment-review`,
						visuallyHiddenText: 'final comment review due date',
						attributes: { 'data-cy': 'final-comment-review-due-date' }
					}
				]
			},
			classes: 'appeal-final-comment-review-due-date'
		}
	}
});
