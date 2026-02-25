import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { textSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapValidAt = ({
	appealDetails,
	appellantCase,
	currentRoute,
	userHasUpdateCasePermission
}) =>
	textSummaryListItem({
		id: 'valid-date',
		text: 'Valid date',
		value: dateISOStringToDisplayDate(appealDetails.validAt, 'Not validated'),
		link: appealDetails.validAt
			? `${currentRoute}/appellant-case/valid/date`
			: `${currentRoute}/appellant-case`,
		actionText:
			!appealDetails.caseOfficer || appealDetails.startedAt || appellantCase?.isEnforcementChild
				? ''
				: appealDetails.validAt
					? 'Change'
					: 'Validate',
		editable: Boolean(userHasUpdateCasePermission),
		classes: 'appeal-valid-date'
	});
