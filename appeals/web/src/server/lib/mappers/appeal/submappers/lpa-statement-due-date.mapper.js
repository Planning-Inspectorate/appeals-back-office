import { dateISOStringToDisplayDate } from '#lib/dates.js';

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapLpaStatementDueDate = ({ appealDetails, currentRoute }) => ({
	id: 'lpa-statement-due-date',
	display: {
		summaryListItem: {
			key: {
				text: 'LPA statements due'
			},
			value: {
				// @ts-ignore
				html: dateISOStringToDisplayDate(appealDetails.appealTimetable?.lpaStatementDueDate) || ''
			},
			actions: {
				items: [
					appealDetails.validAt
						? {
								text: 'Change',
								href: `${currentRoute}/appellant-case/valid/date`,
								visuallyHiddenText:
									'The date all case documentation was received and the appeal was valid',
								attributes: { 'data-cy': 'change-lpa-statement-due-date' }
						  }
						: {}
				]
			},
			classes: 'appeal-lpa-statement-due-date'
		}
	}
});
