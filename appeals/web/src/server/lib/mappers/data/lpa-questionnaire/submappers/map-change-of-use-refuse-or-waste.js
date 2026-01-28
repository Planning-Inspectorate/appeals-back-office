import { booleanSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapChangeOfUseRefuseOrWaste = ({
	lpaQuestionnaireData,
	currentRoute,
	userHasUpdateCase
}) =>
	booleanSummaryListItem({
		id: 'change-of-use-refuse-or-waste',
		text: 'Does the enforcement notice include a change of use of land to dispose refuse or waste materials?',
		value: lpaQuestionnaireData.changeOfUseRefuseOrWaste,
		link: `${currentRoute}/change-of-use-refuse-or-waste/change`,
		editable: userHasUpdateCase
	});
