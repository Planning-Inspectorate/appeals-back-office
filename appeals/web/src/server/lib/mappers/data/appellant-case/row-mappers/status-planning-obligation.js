import { formatPlanningObligationStatus } from '#lib/display-page-formatter.js';
import { textSummaryListItem } from '#lib/mappers/components/index.js';

/** @type {import('../mapper.js').RowMapper} */
export const mapStatusPlanningObligation = ({
	appellantCaseData,
	currentRoute,
	userHasUpdateCase
}) =>
	textSummaryListItem({
		id: 'planning-obligation-status',
		text: 'Planning obligation status',
		value: formatPlanningObligationStatus(appellantCaseData.planningObligation?.status),
		link: `${currentRoute}/planning-obligation/status/change`,
		editable: userHasUpdateCase
	});
