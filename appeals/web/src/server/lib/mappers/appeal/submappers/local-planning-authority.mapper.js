import { textSummaryListItem } from '#lib/mappers/components/text.js';

/** @type {import('../appeal.mapper.js').SubMapper} */
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
		userHasEditPermission: userHasUpdateCasePermission,
		classes: 'appeal-local-planning-authority'
	});
