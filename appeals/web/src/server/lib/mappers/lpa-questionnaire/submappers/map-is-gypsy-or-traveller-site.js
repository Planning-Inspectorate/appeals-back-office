import { booleanSummaryListItem } from '#lib/mappers/components/boolean.js';

/** @type {import("../lpa-questionnaire.mapper.js").SubMapper} */
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
