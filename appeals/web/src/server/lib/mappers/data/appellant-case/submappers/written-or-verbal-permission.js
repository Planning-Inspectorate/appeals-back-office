import { INTEREST_IN_LAND } from '#lib/constants.js';
import { textSummaryListItem } from '#lib/mappers/index.js';
import { capitalizeFirstLetter } from '#lib/string-utilities.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapWrittenOrVerbalPermission = ({
	appellantCaseData,
	currentRoute,
	userHasUpdateCase
}) => {
	const id = 'written-or-verbal-permission';

	const interestInLand = appellantCaseData.enforcementNotice?.interestInLand;
	const isOtherInterest = !!interestInLand && !INTEREST_IN_LAND.includes(interestInLand);

	if (!isOtherInterest) {
		return { id, display: {} };
	}

	return textSummaryListItem({
		id,
		text: 'Do you have written or verbal permission to use the land?',
		value: appellantCaseData.enforcementNotice?.writtenOrVerbalPermission
			? capitalizeFirstLetter(appellantCaseData.enforcementNotice?.writtenOrVerbalPermission)
			: 'Not answered',
		link: `${currentRoute}/written-or-verbal-permission/change`,
		editable: userHasUpdateCase
	});
};
