import { dateToDisplayDate } from '#lib/dates.js';

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapLpaQuestionnaireDueDate = ({ appealDetails, currentRoute }) => ({
	id: 'lpa-questionnaire-due-date',
	display: {
		summaryListItem: {
			key: {
				text: 'LPA questionnaire due'
			},
			value: {
				html:
					dateToDisplayDate(appealDetails.appealTimetable?.lpaQuestionnaireDueDate) ||
					'Due date not yet set'
			},
			actions: {
				items: [
					{
						text: 'Change',
						href: `${currentRoute}/appeal-timetables/lpa-questionnaire`,
						visuallyHiddenText: 'L P A questionnaire due',
						attributes: { 'data-cy': 'change-lpa-questionnaire-due-date' }
					}
				]
			},
			classes: 'appeal-lpa-questionnaire-due-date'
		}
	}
});
