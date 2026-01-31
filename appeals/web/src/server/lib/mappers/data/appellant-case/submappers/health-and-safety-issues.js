import { booleanWithDetailsSummaryListItem } from '#lib/mappers/components/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapHealthAndSafetyIssues = ({ appellantCaseData, currentRoute, userHasUpdateCase }) =>
	booleanWithDetailsSummaryListItem({
		id: 'appellant-case-health-and-safety',
		text: 'Are there any health and safety issues on the appeal site?',
		value: appellantCaseData.healthAndSafety?.hasIssues,
		valueDetails: appellantCaseData.healthAndSafety?.details,
		defaultText: 'No data',
		link: `${currentRoute}/safety-risks/change/appellant`,
		editable: userHasUpdateCase && !appellantCaseData.isEnforcementChild,
		addCyAttribute: true,
		withShowMore: true,
		showMoreLabelText: 'Enter reason'
	});
