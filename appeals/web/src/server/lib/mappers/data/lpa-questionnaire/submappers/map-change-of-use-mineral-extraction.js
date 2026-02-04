import { booleanSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapChangeOfUseMineralExtraction = ({
	lpaQuestionnaireData,
	currentRoute,
	userHasUpdateCase
}) =>
	booleanSummaryListItem({
		id: 'change-of-use-mineral-extraction',
		text: 'Does the enforcement notice include the change of use of land to dispose of remaining materials after mineral extraction?',
		value: lpaQuestionnaireData.changeOfUseMineralExtraction,
		link: `${currentRoute}/change-of-use-mineral-extraction/change`,
		editable: userHasUpdateCase
	});
