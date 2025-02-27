import { booleanSummaryListItem } from '#lib/mappers/index.js';

/** @type {import("../mapper.js").RowMapper} */
export const mapIsGypsyOrTravellerSite = ({
	lpaQuestionnaireData,
	currentRoute,
	userHasUpdateCase
}) =>
	booleanSummaryListItem({
		id: 'is-gypsy-or-traveller-site',
		text: 'Affects Gypsy or Traveller communities',
		value: lpaQuestionnaireData.isGypsyOrTravellerSite,
		defaultText: '',
		addCyAttribute: true,
		link: `${currentRoute}/is-gypsy-or-traveller-site/change`,
		editable: userHasUpdateCase
	});
