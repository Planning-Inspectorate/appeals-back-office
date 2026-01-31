import { textSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapDescriptionOfAllegedBreach = ({
	appellantCaseData,
	currentRoute,
	userHasUpdateCase
}) => {
	const id = 'alleged-breach-description';
	const hasData = appellantCaseData.enforcementNotice?.descriptionOfAllegedBreach !== null;
	return textSummaryListItem({
		id,
		text: 'Description of the alleged breach',
		value: appellantCaseData.enforcementNotice?.descriptionOfAllegedBreach || 'No data',
		link: `${currentRoute}/${id}/change`,
		editable: hasData && userHasUpdateCase && !appellantCaseData.isEnforcementChild,
		withShowMore: true,
		toggleTextCollapsed: 'Show more',
		toggleTextExpanded: 'Show less',
		cypressDataName: id
	});
};
