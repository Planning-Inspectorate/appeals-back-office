import { booleanSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapWithinTrunkRoadDistance = ({
	lpaQuestionnaireData,
	currentRoute,
	userHasUpdateCase
}) =>
	booleanSummaryListItem({
		id: 'trunk-road',
		text: 'Is the appeal site within 67 meters of a trunk road?',
		// @ts-ignore
		value: lpaQuestionnaireData.affectedTrunkRoadName !== null,
		link: `${currentRoute}/trunk-road`,
		editable: userHasUpdateCase
	});
