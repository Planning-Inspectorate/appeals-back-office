import { formatPlanningObligationStatus } from '#lib/display-page-formatter.js';
import { textSummaryListItem } from '#lib/mappers/components/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapStatusPlanningObligation = ({
	appellantCaseData,
	currentRoute,
	userHasUpdateCase
}) =>
	textSummaryListItem({
		id: 'planning-obligation-status',
		text: 'What is the status of your planning obligation?',
		value: formatPlanningObligationStatus(appellantCaseData.planningObligation?.status),
		link: `${currentRoute}/planning-obligation/status/change`,
		editable: userHasUpdateCase && !appellantCaseData.isEnforcementChild
	});
