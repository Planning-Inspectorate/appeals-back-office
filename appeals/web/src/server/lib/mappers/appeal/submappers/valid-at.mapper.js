import { dateToDisplayDate } from '#lib/dates.js';

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapValidAt = ({ appealDetails, currentRoute }) => ({
	id: 'valid-date',
	display: {
		summaryListItem: {
			key: {
				text: 'Valid date'
			},
			value: {
				html: dateToDisplayDate(appealDetails.validAt) || ''
			},
			actions: {
				items: [
					appealDetails.validAt
						? {
								text: 'Change',
								href: `${currentRoute}/appellant-case/valid/date`,
								visuallyHiddenText:
									'The date all case documentation was received and the appeal was valid',
								attributes: { 'data-cy': 'change-valid-date' }
						  }
						: {}
				]
			},
			classes: 'appeal-valid-date'
		}
	}
});
