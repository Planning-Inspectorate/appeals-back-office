import { booleanSummaryListItem } from '#lib/mappers/components/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapAdvertisementInPosition = ({
	appellantCaseData,
	currentRoute,
	userHasUpdateCase
}) =>
	booleanSummaryListItem({
		id: 'advertisement-in-position',
		text: 'Is the advertisement in position?',
		value: appellantCaseData.advertInPosition,
		link: `${currentRoute}/advertisement-in-position/change`,
		editable: userHasUpdateCase
	});
