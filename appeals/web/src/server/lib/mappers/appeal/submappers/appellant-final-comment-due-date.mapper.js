import { dateToDisplayDate } from '#lib/dates.js';

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapAppellantFinalCommentDueDate = ({ appealDetails, currentRoute }) => ({
	id: 'appellant-final-comment-due-date',
	display: {
		summaryListItem: {
			key: {
				text: 'Appellant final comments due'
			},
			value: {
				// @ts-ignore
				html: dateToDisplayDate(appealDetails.appealTimetable?.appellantFinalCommentDueDate) || ''
			},
			actions: {
				items: [
					appealDetails.validAt
						? {
								text: 'Change',
								href: `${currentRoute}/appellant-case/valid/date`,
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
