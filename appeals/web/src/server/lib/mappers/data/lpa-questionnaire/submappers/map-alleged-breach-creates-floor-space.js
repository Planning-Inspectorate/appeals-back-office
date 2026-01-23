import { booleanSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapAllegedBreachCreatesFloorSpace = ({
	lpaQuestionnaireData,
	currentRoute,
	userHasUpdateCase
}) =>
	booleanSummaryListItem({
		id: 'breach-floor-space',
		text: 'Does the alleged breach create any floor space?',
		// @ts-ignore
		value: lpaQuestionnaireData.doesAllegedBreachCreateFloorSpace,
		link: `${currentRoute}/breach-floor-space`,
		editable: userHasUpdateCase
	});
