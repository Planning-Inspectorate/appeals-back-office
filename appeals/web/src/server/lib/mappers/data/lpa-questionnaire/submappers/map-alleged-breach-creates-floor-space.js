import { booleanSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapAllegedBreachCreatesFloorSpace = ({
	lpaQuestionnaireData,
	currentRoute,
	userHasUpdateCase
}) =>
	booleanSummaryListItem({
		id: 'alleged-breach-creates-floor-space',
		text: 'Does the alleged breach create any floor space?',
		value: lpaQuestionnaireData.doesAllegedBreachCreateFloorSpace,
		link: `${currentRoute}/alleged-breach-creates-floor-space/change`,
		defaultText: 'No data',
		addCyAttribute: true,
		editable: userHasUpdateCase
	});
