import { booleanWithDetailsSummaryListItem } from '#lib/mappers/index.js';

/** @type {import("../lpa-questionnaire.mapper.js").SubMapper} */
export const mapLpaHealthAndSafety = ({ lpaQuestionnaireData, currentRoute, userHasUpdateCase }) =>
	booleanWithDetailsSummaryListItem({
		id: 'health-and-safety',
		text: 'Potential safety risks',
		value: lpaQuestionnaireData.doesSiteHaveHealthAndSafetyIssues,
		valueDetails: lpaQuestionnaireData.healthAndSafetyDetails,
		defaultText: 'No answer provided',
		link: `${currentRoute}/safety-risks/change/lpa`,
		editable: userHasUpdateCase,
		addCyAttribute: true,
		classes: 'lpa-health-and-safety',
		withShowMore: true,
		showMoreLabelText: 'Potential safety risks details'
	});
