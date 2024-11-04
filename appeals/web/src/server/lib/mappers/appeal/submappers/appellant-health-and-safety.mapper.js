import { booleanWithDetailsSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapAppellantHealthAndSafety = ({
	appealDetails,
	currentRoute,
	userHasUpdateCasePermission
}) =>
	booleanWithDetailsSummaryListItem({
		id: 'appellant-case-health-and-safety',
		text: 'Potential safety risks (appellant answer)',
		value: appealDetails.healthAndSafety.appellantCase.hasIssues,
		valueDetails: appealDetails.healthAndSafety.appellantCase.details,
		defaultText: 'No answer provided',
		link: `${currentRoute}/safety-risks/change/appellant`,
		editable: userHasUpdateCasePermission,
		classes: 'appeal-appellant-health-and-safety',
		withShowMore: true,
		showMoreLabelText: 'Potential safety risks details (appellant answer)'
	});
