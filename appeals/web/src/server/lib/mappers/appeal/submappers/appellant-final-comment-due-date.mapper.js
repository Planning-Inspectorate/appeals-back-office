import { dateISOStringToDisplayDate } from '#lib/dates.js';

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapAppellantFinalCommentDueDate = ({ appealDetails, currentRoute }) => ({
	id: 'appellant-final-comment-due-date',
	display: {
		summaryListItem: {
			key: {
				text: 'Appellant final comments due'
			},
			value: {
				html:
					dateISOStringToDisplayDate(
						appealDetails.appealTimetable?.appellantFinalCommentsDueDate
					) || ''
			},
			actions: {
				items: [
					appealDetails.validAt
						? {
								text: 'Change',
								href: `${currentRoute}/appeal-timetables/appellant-final-comments`,
								visuallyHiddenText:
									'The date all case documentation was received and the appeal was valid',
								attributes: { 'data-cy': 'change-appellant-final-comment-due-date' }
						  }
						: {}
				]
			},
			classes: 'appeal-appellant-final-comment-due-date'
		}
	}
});
