import { booleanSummaryListItem } from '#lib/mappers/index.js';

/** @type {import("../mapper.js").SubMapper} */
export const mapEiaColumnTwoThreshold = ({
	lpaQuestionnaireData,
	userHasUpdateCase,
	currentRoute
}) =>
	booleanSummaryListItem({
		id: 'eia-column-two-threshold',
		text: 'Does the development meet or exceed the threshold or criteria in column 2?',
		value: lpaQuestionnaireData.eiaColumnTwoThreshold,
		defaultText: 'Not applicable',
		addCyAttribute: true,
		link: `${currentRoute}/environmental-impact-assessment/column-two-threshold/change`,
		editable: userHasUpdateCase,
		classes: 'lpa-eia-column-two-threshold'
	});
