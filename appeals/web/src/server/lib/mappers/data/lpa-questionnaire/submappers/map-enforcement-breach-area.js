import { booleanWithDetailsSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapEnforcementBreachArea = ({
	lpaQuestionnaireData,
	currentRoute,
	userHasUpdateCase
}) => {
	const valueDetails = lpaQuestionnaireData?.areaOfAllegedBreachInSquareMetres
		? `${lpaQuestionnaireData?.areaOfAllegedBreachInSquareMetres}m²`
		: null;
	return booleanWithDetailsSummaryListItem({
		id: 'has-alleged-breach-area',
		text: 'Is the area of the alleged breach the same as the site area?',
		value: !lpaQuestionnaireData.areaOfAllegedBreachInSquareMetres,
		valueDetails: valueDetails,
		link: `${currentRoute}/has-alleged-breach-area/change`,
		defaultText: 'No data',
		editable: userHasUpdateCase,
		withShowMore: true,
		showMoreLabelText: 'Enter the area of the alleged breach in square metres',
		showDetailsWhenAnswerIsNo: true
	});
};
