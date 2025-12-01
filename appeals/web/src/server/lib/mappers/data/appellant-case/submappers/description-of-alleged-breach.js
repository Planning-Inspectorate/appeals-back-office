import { textSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapDescriptionOfAllegedBreach = ({
	appellantCaseData,
	currentRoute,
	userHasUpdateCase
}) => {
	const hasData = appellantCaseData.enforcementNotice?.descriptionOfAllegedBreach !== null;
	return textSummaryListItem({
		id: 'description-of-alleged-breach',
		text: 'Description of the alleged breach',
		value: appellantCaseData.enforcementNotice?.descriptionOfAllegedBreach || 'No data',
		link: `${currentRoute}/description-of-alleged-breach/change`,
		editable: hasData && userHasUpdateCase
	});
};
