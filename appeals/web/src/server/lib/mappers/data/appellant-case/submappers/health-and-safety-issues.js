import { booleanWithDetailsSummaryListItem } from '#lib/mappers/components/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapHealthAndSafetyIssues = ({ appellantCaseData, currentRoute, userHasUpdateCase }) =>
	booleanWithDetailsSummaryListItem({
		id: 'appellant-case-health-and-safety',
		text: 'Potential safety risks',
		value: appellantCaseData.healthAndSafety?.hasIssues,
		valueDetails: appellantCaseData.healthAndSafety?.details,
		defaultText: 'No answer provided',
		link: `${currentRoute}/safety-risks/change/appellant`,
		editable: userHasUpdateCase,
		addCyAttribute: true,
		withShowMore: true,
		showMoreLabelText: 'Potential safety risks details'
	});
