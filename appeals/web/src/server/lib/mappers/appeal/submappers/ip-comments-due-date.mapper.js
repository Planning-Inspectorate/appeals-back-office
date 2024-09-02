import { dateToDisplayDate } from '#lib/dates.js';

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapIpCommentsDueDate = ({ appealDetails, currentRoute }) => ({
	id: 'ip-comments-due-date',
	display: {
		summaryListItem: {
			key: {
				text: 'Comments from interested parties due'
			},
			value: {
				// @ts-ignore
				html: dateToDisplayDate(appealDetails.appealTimetable?.ipCommentsDueDate) || ''
			},
			actions: {
				items: [
					appealDetails.validAt
						? {
								text: 'Change',
								href: `${currentRoute}/appellant-case/valid/date`,
								visuallyHiddenText:
									'The date all case documentation was received and the appeal was valid',
								attributes: { 'data-cy': 'change-ip-comments-due-date' }
						  }
						: {}
				]
			},
			classes: 'appeal-ip-comments-due-date'
		}
	}
});
