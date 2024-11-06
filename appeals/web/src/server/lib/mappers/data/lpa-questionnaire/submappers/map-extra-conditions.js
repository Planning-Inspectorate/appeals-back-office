import { booleanWithDetailsSummaryListItem } from '#lib/mappers/index.js';

/** @type {import("../mapper.js").SubMapper} */
export const mapExtraConditions = ({ lpaQuestionnaireData, currentRoute, userHasUpdateCase }) =>
	booleanWithDetailsSummaryListItem({
		id: 'extra-conditions',
		text: 'Extra conditions',
		value: lpaQuestionnaireData.hasExtraConditions,
		valueDetails: lpaQuestionnaireData.extraConditions,
		defaultText: '',
		link: `${currentRoute}/extra-conditions/change`,
		editable: userHasUpdateCase,
		withShowMore: true,
		showMoreLabelText: 'Extra conditions details'
	});
