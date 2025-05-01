import { textSummaryListItem } from '#lib/mappers/index.js';

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
		editable: userHasUpdateCasePermission, //todo: a2-2605 - add logic if LPAQ submitted
		actionText: 'Change',
		classes: 'appeal-local-planning-authority'
	});
