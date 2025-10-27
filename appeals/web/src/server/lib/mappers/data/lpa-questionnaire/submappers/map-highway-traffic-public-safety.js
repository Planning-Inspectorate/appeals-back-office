import { booleanSummaryListItem } from '#lib/mappers/index.js';

/** @type {import("../mapper.js").SubMapper} */
export const mapHighwayTrafficPublicSafety = ({
	lpaQuestionnaireData,
	currentRoute,
	userHasUpdateCase
}) =>
	booleanSummaryListItem({
		id: 'public-safety',
		text: 'Did you refuse the application because of highway or traffic public safety?',
		value: lpaQuestionnaireData.wasApplicationRefusedDueToHighwayOrTraffic,
		defaultText: '',
		addCyAttribute: true,
		link: `${currentRoute}/public-safety/change`,
		editable: userHasUpdateCase
	});
