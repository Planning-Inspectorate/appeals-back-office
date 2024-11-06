import { textSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapLocalPlanningAuthority = ({
	appealDetails,
	currentRoute,
	userHasUpdateCasePermission
}) =>
	textSummaryListItem({
		id: 'local-planning-authority',
		text: 'Local planning authority (LPA)',
		value: appealDetails.localPlanningDepartment,
		link: `${currentRoute}/change-appeal-details/local-planning-authority`,
		editable: userHasUpdateCasePermission,
		classes: 'appeal-local-planning-authority'
	});
