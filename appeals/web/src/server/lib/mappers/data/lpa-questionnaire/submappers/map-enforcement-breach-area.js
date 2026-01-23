import { booleanSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapEnforcementBreachArea = ({
	lpaQuestionnaireData,
	currentRoute,
	userHasUpdateCase
}) =>
	booleanSummaryListItem({
		id: 'breach-area',
		text: 'Is the area of the alleged breach the same as the site area?',
		// @ts-ignore
		value: lpaQuestionnaireData.hasAllegedBreachArea,
		link: `${currentRoute}/breach-area`,
		editable: userHasUpdateCase
	});
