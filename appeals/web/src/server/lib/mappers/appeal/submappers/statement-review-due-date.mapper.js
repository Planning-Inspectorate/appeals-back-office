import { dateToDisplayDate } from '#lib/dates.js';

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapStatementReviewDueDate = ({ appealDetails, currentRoute }) => ({
	id: 'statement-review-due-date',
	display: {
		summaryListItem: {
			key: {
				text: 'Statement review due'
			},
			value: {
				html:
					dateToDisplayDate(appealDetails.appealTimetable?.statementReviewDate) ||
					'Due date not yet set'
			},
			actions: {
				items: [
					{
						text: appealDetails.appealTimetable?.statementReviewDate ? 'Change' : 'Schedule',
						href: `${currentRoute}/appeal-timetables/statement-review`,
						visuallyHiddenText: 'statement review due date',
						attributes: { 'data-cy': 'statement-review-due-date' }
					}
				]
			},
			classes: 'appeal-statement-review-due-date'
		}
	}
});
