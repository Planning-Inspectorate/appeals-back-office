import { booleanSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapRelatesToSingleDwellingHouse = ({
	lpaQuestionnaireData,
	currentRoute,
	userHasUpdateCase
}) =>
	booleanSummaryListItem({
		id: 'single-dwelling-house',
		text: 'Is the enforcement notice for a single private dwelling house?',
		// @ts-ignore
		value: lpaQuestionnaireData.relatesToBuildingSingleDwellingHouse,
		link: `${currentRoute}/dwelling-house`,
		editable: userHasUpdateCase
	});
