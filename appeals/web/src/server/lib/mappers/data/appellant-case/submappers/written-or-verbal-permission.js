import { textSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapWrittenOrVerbalPermission = ({
	appellantCaseData,
	currentRoute,
	userHasUpdateCase
}) => {
	const id = 'written-or-verbal-permission';

	const isOtherInterest =
		appellantCaseData.enforcementNotice?.interestInLand?.toLowerCase() === 'other';

	if (!isOtherInterest) {
		return { id, display: {} };
	}

	const hasData = appellantCaseData.enforcementNotice?.writtenOrVerbalPermission !== null;
	return textSummaryListItem({
		id,
		text: 'Do you have written or verbal permission to use the land?',
		value: appellantCaseData.enforcementNotice?.writtenOrVerbalPermission || 'No data',
		link: `${currentRoute}/written-or-verbal-permission/change`,
		editable: hasData && userHasUpdateCase
	});
};
