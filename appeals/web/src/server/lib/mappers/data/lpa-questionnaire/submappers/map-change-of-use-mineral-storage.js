import { booleanSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapChangeOfUseMineralStorage = ({
	lpaQuestionnaireData,
	currentRoute,
	userHasUpdateCase
}) =>
	booleanSummaryListItem({
		id: 'mineral-storage',
		text: 'Does the enforcement notice include a change of use of land to store minerals in the open?',
		// @ts-ignore
		value: lpaQuestionnaireData.changeOfUseMineralStorage,
		link: `${currentRoute}/mineral-storage`,
		editable: userHasUpdateCase
	});
