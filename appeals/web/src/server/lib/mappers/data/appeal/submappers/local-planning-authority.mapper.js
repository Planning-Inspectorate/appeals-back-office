import { textSummaryListItem } from '#lib/mappers/index.js';
import { isLpaqReceived } from '#lib/mappers/utils/is-lpaq-received.js';
import { isGenericAppealType } from '@pins/appeals/utils/appeal-type-checks.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapLocalPlanningAuthority = ({
	appealDetails,
	currentRoute,
	userHasUpdateCasePermission
}) => {
	const isGeneric = isGenericAppealType(appealDetails?.appealType);

	return textSummaryListItem({
		id: 'local-planning-authority',
		text: 'LPA',
		value: appealDetails.localPlanningDepartment,
		link: `${currentRoute}/change-appeal-details/local-planning-authority`,
		editable:
			userHasUpdateCasePermission && !appealDetails.isChildAppeal && !isLpaqReceived(appealDetails),
		actionText: isGeneric && !appealDetails.localPlanningDepartment ? 'Add' : 'Change',
		classes: 'appeal-local-planning-authority'
	});
};
