import { booleanSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapEnforcementBreachArea = ({
	lpaQuestionnaireData,
	currentRoute,
	userHasUpdateCase
}) =>
	booleanSummaryListItem({
		id: 'has-alleged-breach-area',
		text: 'Is the area of the alleged breach the same as the site area?',
		value: lpaQuestionnaireData.hasAllegedBreachArea,
		link: `${currentRoute}/has-alleged-breach-area/change`,
		defaultText: 'No data',
		addCyAttribute: true,
		editable: userHasUpdateCase
	});
