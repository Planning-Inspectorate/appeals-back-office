import { booleanSummaryListItem } from '#lib/mappers/index.js';

/** @type {import("../mapper.js").SubMapper} */
export const mapEiaRequiresEnvironmentalStatement = ({
	lpaQuestionnaireData,
	userHasUpdateCase,
	currentRoute
}) =>
	booleanSummaryListItem({
		id: 'eia-requires-environmental-statement',
		text: 'Did your screening opinion say the development needed an environmental statement?',
		value:
			lpaQuestionnaireData.eiaRequiresEnvironmentalStatement === undefined ||
			lpaQuestionnaireData.eiaRequiresEnvironmentalStatement === null
				? null
				: lpaQuestionnaireData.eiaRequiresEnvironmentalStatement,
		defaultText: 'Not answered',
		addCyAttribute: true,
		link: `${currentRoute}/environmental-impact-assessment/requires-environmental-statement/change`,
		editable: userHasUpdateCase,
		classes: 'lpa-eia-requires-environmental-statement'
	});
