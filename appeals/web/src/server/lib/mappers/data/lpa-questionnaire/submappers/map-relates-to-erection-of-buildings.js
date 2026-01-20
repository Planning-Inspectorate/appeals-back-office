import { booleanSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapRelatesToErectionOfBuildings = ({
	lpaQuestionnaireData,
	currentRoute,
	userHasUpdateCase
}) =>
	booleanSummaryListItem({
		id: 'erection-buildings',
		text: 'Does the enforcement notice include the erection of a building or buildings?',
		// @ts-ignore
		value: lpaQuestionnaireData.relatesToErectionOfBuildingOrBuildings,
		link: `${currentRoute}/erection-buildings`,
		editable: userHasUpdateCase
	});
