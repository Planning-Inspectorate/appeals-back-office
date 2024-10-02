import { dateISOStringToDisplayDate } from '#lib/dates.js';

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapIssueDeterminationDate = ({ appealDetails, currentRoute }) => ({
	id: 'issue-determination',
	display: {
		summaryListItem: {
			key: {
				text: 'Issue determination'
			},
			value: {
				html:
					dateISOStringToDisplayDate(appealDetails.appealTimetable?.issueDeterminationDate) ||
					'Due date not yet set'
			},
			actions: {
				items: [
					{
						text: appealDetails.appealTimetable?.issueDeterminationDate ? 'Change' : 'Schedule',
						href: `${currentRoute}/appeal-timetables/issue-determination`,
						attributes: {
							'data-cy':
								(appealDetails.appealTimetable?.issueDeterminationDate ? 'change' : 'schedule') +
								'-issue-determination'
						}
					}
				]
			},
			classes: 'appeal-issue-determination'
		}
	}
});
