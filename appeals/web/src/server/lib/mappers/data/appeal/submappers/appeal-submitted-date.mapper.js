import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { textSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapAppealSubmittedDate = ({ appealDetails }) => {
	return textSummaryListItem({
		id: 'appeal-submitted-date',
		text: 'Appeal submitted date',
		value: dateISOStringToDisplayDate(appealDetails.createdAt, 'No date'),
		link: '',
		editable: false,
		classes: 'appeal-submitted-date'
	});
};
