import { booleanSummaryListItem } from '#lib/mappers/index.js';

/** @type {import("../mapper.js").SubMapper} */
export const mapIsGypsyOrTravellerSite = ({
	lpaQuestionnaireData,
	currentRoute,
	userHasUpdateCase
}) =>
	booleanSummaryListItem({
		id: 'is-gypsy-or-traveller-site',
		text: 'Does the development relate to anyone claiming to be a Gypsy or Traveller?',
		value: lpaQuestionnaireData.isGypsyOrTravellerSite,
		defaultText: '',
		addCyAttribute: true,
		link: `${currentRoute}/is-gypsy-or-traveller-site/change`,
		editable: userHasUpdateCase
	});
