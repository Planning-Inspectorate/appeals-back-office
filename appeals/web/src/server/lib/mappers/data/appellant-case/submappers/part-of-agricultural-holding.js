import { booleanSummaryListItem } from '#lib/mappers/components/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapPartOfAgriculturalHolding = ({
	appellantCaseData,
	currentRoute,
	userHasUpdateCase
}) =>
	booleanSummaryListItem({
		id: 'part-of-agricultural-holding',
		text: 'Is the appeal site part of an agricultural holding?',
		value: appellantCaseData.agriculturalHolding?.isPartOfAgriculturalHolding,
		defaultText: 'No data',
		link: `${currentRoute}/agricultural-holding/change`,
		editable: userHasUpdateCase
	});
