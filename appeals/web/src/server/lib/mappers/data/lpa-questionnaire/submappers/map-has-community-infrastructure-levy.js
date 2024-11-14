import { booleanSummaryListItem } from '#lib/mappers/index.js';

/** @type {import("../mapper.js").SubMapper} */
export const mapHasCommunityInfrastructureLevy = ({
	lpaQuestionnaireData,
	currentRoute,
	userHasUpdateCase
}) =>
	booleanSummaryListItem({
		id: 'has-community-infrastructure-levy',
		text: 'Community infrastructure levy',
		value: lpaQuestionnaireData.hasInfrastructureLevy,
		defaultText: '',
		addCyAttribute: true,
		link: `${currentRoute}/has-community-infrastructure-levy/change`,
		editable: userHasUpdateCase
	});
