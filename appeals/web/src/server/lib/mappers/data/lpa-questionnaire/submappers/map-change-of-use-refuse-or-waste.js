import { booleanSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapChangeOfUseRefuseOrWaste = ({
	lpaQuestionnaireData,
	currentRoute,
	userHasUpdateCase
}) =>
	booleanSummaryListItem({
		id: 'refuse-waste',
		text: 'Does the enforcement notice include a change of use of land to dispose refuse or waste materials?',
		// @ts-ignore
		value: lpaQuestionnaireData.changeOfUseRefuseOrWaste,
		link: `${currentRoute}/refuse-waste`,
		editable: userHasUpdateCase
	});
