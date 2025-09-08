import { textSummaryListItem } from '#lib/mappers/components/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapAdvertisementDescription = ({
	appellantCaseData,
	currentRoute,
	userHasUpdateCase
}) =>
	textSummaryListItem({
		id: 'advertisement-description',
		text: 'Enter the description of the advertisement that you submitted in your application',
		value: appellantCaseData.developmentDescription?.details || 'No data',
		link: `${currentRoute}/advertisement-description/change`,
		editable: userHasUpdateCase,
		withShowMore: true,
		showMoreLabelText:
			'Enter the description of the advertisement that you submitted in your application'
	});
