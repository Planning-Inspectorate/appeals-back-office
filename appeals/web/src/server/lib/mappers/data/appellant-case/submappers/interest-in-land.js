import { textSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapInterestInLand = ({ appellantCaseData, currentRoute, userHasUpdateCase }) => {
	const hasData = appellantCaseData.enforcementNotice?.interestInLand !== null;
	return textSummaryListItem({
		id: 'interest-in-land',
		text: 'What is your interest in the land?',
		value: appellantCaseData.enforcementNotice?.interestInLand || 'No data',
		link: `${currentRoute}/interest-in-land/change`,
		editable: hasData && userHasUpdateCase
	});
};
