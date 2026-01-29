import { booleanSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapRelatesToAgriculturalPurpose = ({
	lpaQuestionnaireData,
	currentRoute,
	userHasUpdateCase
}) =>
	booleanSummaryListItem({
		id: 'agricultural-purpose',
		text: 'Is the building on agricultural land and will it be used for agricultural purposes?',
		// @ts-ignore
		value: lpaQuestionnaireData.relatesToBuildingWithAgriculturalPurpose,
		link: `${currentRoute}/agricultural-purpose/change`,
		editable: userHasUpdateCase
	});
