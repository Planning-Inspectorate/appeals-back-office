import { textSummaryListItem } from '#lib/mappers/components/index.js';
import { isLpaqReceived } from '#lib/mappers/utils/is-lpaq-received.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapLocalPlanningAuthority = ({
	appellantCaseData,
	currentRoute,
	userHasUpdateCase,
	appealDetails
}) =>
	textSummaryListItem({
		id: 'local-planning-authority',
		text: 'Which local planning authority (LPA) do you want to appeal against?',
		value: appellantCaseData.localPlanningDepartment,
		link: `${currentRoute}/change-appeal-details/local-planning-authority`,
		editable: userHasUpdateCase && !isLpaqReceived(appealDetails)
	});
