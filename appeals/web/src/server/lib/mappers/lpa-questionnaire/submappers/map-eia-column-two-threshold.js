import { booleanSummaryListItem } from '#lib/mappers/components/boolean.js';

/** @type {import("../lpa-questionnaire.mapper.js").SubMapper} */
export const mapEiaColumnTwoThreshold = ({
	lpaQuestionnaireData,
	userHasUpdateCase,
	currentRoute
}) =>
	booleanSummaryListItem({
		id: 'eia-column-two-threshold',
		text: 'Meets or exceeds column 2 threshold criteria',
		value: lpaQuestionnaireData.eiaColumnTwoThreshold,
		defaultText: '',
		addCyAttribute: true,
		link: `${currentRoute}/environmental-impact-assessment/column-two-threshold/change`,
		editable: userHasUpdateCase
	});