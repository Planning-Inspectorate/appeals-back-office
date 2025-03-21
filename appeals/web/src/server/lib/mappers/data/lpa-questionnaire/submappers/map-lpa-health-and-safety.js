import { booleanWithDetailsSummaryListItem } from '#lib/mappers/index.js';

/** @type {import("../mapper.js").SubMapper} */
export const mapLpaHealthAndSafety = ({ lpaQuestionnaireData, currentRoute, userHasUpdateCase }) =>
	booleanWithDetailsSummaryListItem({
		id: 'health-and-safety',
		text: 'Are there any potential safety risks?',
		value: lpaQuestionnaireData.healthAndSafety?.hasIssues,
		valueDetails: lpaQuestionnaireData.healthAndSafety?.details,
		defaultText: 'No answer provided',
		link: `${currentRoute}/safety-risks/change/lpa`,
		editable: userHasUpdateCase,
		addCyAttribute: true,
		classes: 'lpa-health-and-safety',
		withShowMore: true,
		showMoreLabelText: 'Potential safety risks details'
	});
