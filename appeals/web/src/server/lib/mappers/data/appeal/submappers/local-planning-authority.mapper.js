import { textSummaryListItem } from '#lib/mappers/index.js';
import { isLpaqReceived } from '#lib/mappers/utils/is-lpaq-received.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapLocalPlanningAuthority = ({
	appealDetails,
	currentRoute,
	userHasUpdateCasePermission
}) =>
	textSummaryListItem({
		id: 'local-planning-authority',
		text: 'LPA',
		value: appealDetails.localPlanningDepartment,
		link: `${currentRoute}/change-appeal-details/local-planning-authority`,
		editable:
			userHasUpdateCasePermission && !appealDetails.isChildAppeal && !isLpaqReceived(appealDetails),
		actionText: 'Change',
		classes: 'appeal-local-planning-authority'
	});
