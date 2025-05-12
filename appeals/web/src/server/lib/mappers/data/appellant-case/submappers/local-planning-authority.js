import { textSummaryListItem } from '#lib/mappers/components/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapLocalPlanningAuthority = ({
	appellantCaseData,
	currentRoute
	//userHasUpdateCase
}) =>
	textSummaryListItem({
		id: 'local-planning-authority',
		text: 'Which local planning authority (LPA) do you want to appeal against?',
		value: appellantCaseData.localPlanningDepartment,
		link: `${currentRoute}/change-appeal-details/local-planning-authority`,
		editable: false //todo: a2-2605 userHasUpdateCase
	});
