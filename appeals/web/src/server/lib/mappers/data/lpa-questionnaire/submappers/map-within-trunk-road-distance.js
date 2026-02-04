import { booleanWithDetailsSummaryListItem } from '#lib/mappers/index.js';

/** @type {import("../mapper.js").SubMapper} */
export const mapWithinTrunkRoadDistance = ({
	lpaQuestionnaireData,
	currentRoute,
	userHasUpdateCase
}) =>
	booleanWithDetailsSummaryListItem({
		id: 'trunk-road',
		text: 'Is the appeal site within 67 meters of a trunk road?',
		value: !!lpaQuestionnaireData.affectedTrunkRoadName,
		valueDetails: lpaQuestionnaireData.affectedTrunkRoadName,
		defaultText: '',
		link: `${currentRoute}/trunk-road/change`,
		editable: userHasUpdateCase,
		withShowMore: true,
		showMoreLabelText: 'Enter the road name'
	});
