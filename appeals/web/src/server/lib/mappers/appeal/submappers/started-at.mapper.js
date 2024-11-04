import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { textSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapStartedAt = ({ appealDetails, currentRoute, userHasUpdateCasePermission }) =>
	textSummaryListItem({
		id: 'start-date',
		text: 'Start date',
		value: dateISOStringToDisplayDate(appealDetails.startedAt, 'Not added'),
		link: `${currentRoute}/start-case/add`,
		editable: Boolean(
			appealDetails.validAt && !appealDetails.startedAt && userHasUpdateCasePermission
		),
		classes: 'appeal-start-date',
		actionText: 'Add'
	});
