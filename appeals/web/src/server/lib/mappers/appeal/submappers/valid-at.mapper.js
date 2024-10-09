import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { textSummaryListItem } from '#lib/mappers/components/text.js';

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapValidAt = ({ appealDetails, currentRoute, userHasUpdateCasePermission }) =>
	textSummaryListItem({
		id: 'valid-date',
		text: 'Valid date',
		value: dateISOStringToDisplayDate(appealDetails.validAt) || '',
		link: `${currentRoute}/appellant-case/valid/date`,
		editable: Boolean(appealDetails.validAt && userHasUpdateCasePermission),
		classes: 'appeal-valid-date'
	});
