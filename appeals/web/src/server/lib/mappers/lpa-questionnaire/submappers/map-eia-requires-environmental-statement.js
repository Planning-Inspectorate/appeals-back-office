import { booleanSummaryListItem } from '#lib/mappers/components/boolean.js';

/** @type {import("../lpa-questionnaire.mapper.js").SubMapper} */
export const mapEiaRequiresEnvironmentalStatement = ({
	lpaQuestionnaireData,
	userHasUpdateCase,
	currentRoute
}) =>
	booleanSummaryListItem({
		id: 'eia-requires-environmental-statement',
		text: 'Screening opinion says environmental statement needed',
		value: lpaQuestionnaireData.eiaRequiresEnvironmentalStatement,
		defaultText: '',
		addCyAttribute: true,
		link: `${currentRoute}/environmental-impact-assessment/requires-environmental-statement/change`,
		editable: userHasUpdateCase
	});
