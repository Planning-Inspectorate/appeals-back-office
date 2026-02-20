import { booleanWithDetailsSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapAllegedBreachCreatesFloorSpace = ({
	lpaQuestionnaireData,
	currentRoute,
	userHasUpdateCase
}) =>
	booleanWithDetailsSummaryListItem({
		id: 'alleged-breach-creates-floor-space',
		text: 'Does the alleged breach create any floor space?',
		value: !!lpaQuestionnaireData?.floorSpaceCreatedByBreachInSquareMetres,
		valueDetails: `${lpaQuestionnaireData.floorSpaceCreatedByBreachInSquareMetres}m²`,
		defaultText: 'No data',
		link: `${currentRoute}/alleged-breach-creates-floor-space/change`,
		editable: userHasUpdateCase,
		withShowMore: true,
		showMoreLabelText:
			'Enter the area of floor space created by the alleged breach in square metres'
	});
