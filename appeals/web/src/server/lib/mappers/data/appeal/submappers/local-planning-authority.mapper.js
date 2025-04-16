import { textSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapLocalPlanningAuthority = ({ appealDetails, currentRoute }) =>
	textSummaryListItem({
		id: 'local-planning-authority',
		text: 'LPA',
		value: appealDetails.localPlanningDepartment,
		link: `${currentRoute}/change-appeal-details/local-planning-authority`,
		editable: false,
		classes: 'appeal-local-planning-authority'
	});
