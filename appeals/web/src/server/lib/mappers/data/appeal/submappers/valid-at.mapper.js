import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { textSummaryListItem } from '#lib/mappers/index.js';
import { isGenericAppealType } from '@pins/appeals/utils/appeal-type-checks.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapValidAt = ({
	appealDetails,
	appellantCase,
	currentRoute,
	userHasUpdateCasePermission
}) => {
	const isGeneric = isGenericAppealType(appealDetails?.appealType);

	const link = isGeneric
		? `${currentRoute}/appellant-case/valid/date`
		: appealDetails.validAt
			? `${currentRoute}/appellant-case/valid/date`
			: `${currentRoute}/appellant-case`;

	const actionText = isGeneric
		? appealDetails.validAt
			? 'Change'
			: 'Add'
		: !appealDetails.caseOfficer || appealDetails.startedAt || appellantCase?.isEnforcementChild
			? ''
			: appealDetails.validAt
				? 'Change'
				: 'Validate';

	return textSummaryListItem({
		id: 'valid-date',
		text: 'Valid date',
		value: dateISOStringToDisplayDate(appealDetails.validAt, 'Not validated'),
		link,
		actionText,
		editable: Boolean(userHasUpdateCasePermission),
		classes: 'appeal-valid-date'
	});
};
