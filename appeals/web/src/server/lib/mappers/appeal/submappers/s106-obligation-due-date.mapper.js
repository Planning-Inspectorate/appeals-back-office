import { dateISOStringToDisplayDate } from '#lib/dates.js';

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapS106ObligationDue = ({ appealDetails, currentRoute }) => ({
	id: 's106-obligation-due-date',
	display: {
		summaryListItem: {
			key: {
				text: 'S106 obligation due'
			},
			value: {
				html: dateISOStringToDisplayDate(appealDetails.appealTimetable?.s106ObligationDueDate) || ''
			},
			actions: {
				items: [
					appealDetails.validAt
						? {
								text: 'Change',
								href: `${currentRoute}/appeal-timetables/s106-obligation`,
								visuallyHiddenText:
									'The date all case documentation was received and the appeal was valid',
								attributes: { 'data-cy': 'change-s106-obligation-due-date' }
						  }
						: {}
				]
			},
			classes: 'appeal-s106-obligation-due-date'
		}
	}
});
