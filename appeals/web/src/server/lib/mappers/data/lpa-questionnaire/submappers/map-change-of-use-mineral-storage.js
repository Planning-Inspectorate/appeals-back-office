import { booleanSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapChangeOfUseMineralStorage = ({
	lpaQuestionnaireData,
	currentRoute,
	userHasUpdateCase
}) =>
	booleanSummaryListItem({
		id: 'change-of-use-mineral-storage',
		text: 'Does the enforcement notice include a change of use of land to store minerals in the open?',
		value: lpaQuestionnaireData.changeOfUseMineralStorage,
		link: `${currentRoute}/change-of-use-mineral-storage/change`,
		editable: userHasUpdateCase
	});
