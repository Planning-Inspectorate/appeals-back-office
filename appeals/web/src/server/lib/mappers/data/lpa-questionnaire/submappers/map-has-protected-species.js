import { booleanSummaryListItem } from '#lib/mappers/index.js';

/** @type {import("../mapper.js").SubMapper} */
export const mapHasProtectedSpecies = ({ lpaQuestionnaireData, currentRoute, userHasUpdateCase }) =>
	booleanSummaryListItem({
		id: 'has-protected-species',
		text: 'Affects protected species',
		value: lpaQuestionnaireData.hasProtectedSpecies,
		defaultText: '',
		addCyAttribute: true,
		link: `${currentRoute}/has-protected-species/change`,
		editable: userHasUpdateCase
	});
