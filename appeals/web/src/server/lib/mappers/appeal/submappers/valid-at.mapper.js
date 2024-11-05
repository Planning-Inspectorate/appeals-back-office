import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { textSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapValidAt = ({ appealDetails, currentRoute, userHasUpdateCasePermission }) =>
	textSummaryListItem({
		id: 'valid-date',
		text: 'Valid date',
		value: dateISOStringToDisplayDate(appealDetails.validAt, 'Not added'),
		link: `${currentRoute}/appellant-case/valid/date`,
		editable: Boolean(
			appealDetails.validAt && !appealDetails.startedAt && userHasUpdateCasePermission
		),
		classes: 'appeal-valid-date'
	});
