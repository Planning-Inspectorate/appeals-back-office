import { dateToDisplayDate } from '#lib/dates.js';

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapLpaFinalCommentDueDate = ({ appealDetails, currentRoute }) => ({
	id: 'lpa-final-comment-due-date',
	display: {
		summaryListItem: {
			key: {
				text: 'LPA final comments due'
			},
			value: {
				// @ts-ignore
				html: dateToDisplayDate(appealDetails.appealTimetable?.lpaFinalCommentDueDate) || ''
			},
			actions: {
				items: [
					appealDetails.validAt
						? {
								text: 'Change',
								href: `${currentRoute}/lpa-case/valid/date`,
								visuallyHiddenText:
									'The date all case documentation was received and the appeal was valid',
								attributes: { 'data-cy': 'change-lpa-final-comment-due-date' }
						  }
						: {}
				]
			},
			classes: 'appeal-lpa-final-comment-due-date'
		}
	}
});
