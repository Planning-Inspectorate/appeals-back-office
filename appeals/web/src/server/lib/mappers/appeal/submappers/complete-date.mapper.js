import { dateToDisplayDate } from '#lib/dates.js';

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapCompleteDate = ({ appealDetails, currentRoute }) => ({
	id: 'complete-date',
	display: {
		summaryListItem: {
			key: {
				text: 'Complete'
			},
			value: {
				html:
					dateToDisplayDate(appealDetails.appealTimetable?.completeDate) || 'Due date not yet set'
			},
			actions: {
				items: [
					{
						text: appealDetails.appealTimetable?.completeDate ? 'Change' : 'Schedule',
						href: `${currentRoute}/change-appeal-details/complete-date`,
						attributes: {
							'data-cy':
								(appealDetails.appealTimetable?.completeDate ? 'change' : 'schedule') +
								'-complete-date'
						}
					}
				]
			},
			classes: 'appeal-complete-date'
		}
	}
});
