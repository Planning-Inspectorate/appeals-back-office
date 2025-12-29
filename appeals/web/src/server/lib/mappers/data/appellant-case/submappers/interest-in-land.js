import { INTEREST_IN_LAND } from '#lib/constants.js';
import { textSummaryListItem } from '#lib/mappers/index.js';
import { toSentenceCase } from '#lib/string-utilities.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapInterestInLand = ({ appellantCaseData, currentRoute, userHasUpdateCase }) => {
	const interestInLand = appellantCaseData.enforcementNotice?.interestInLand;

	return textSummaryListItem({
		id: 'interest-in-land',
		text: 'What is your interest in the land?',
		value: INTEREST_IN_LAND.includes(/** @type {string} */ (interestInLand))
			? toSentenceCase(/** @type {string} */ (interestInLand))
			: interestInLand || 'Not answered',
		link: `${currentRoute}/interest-in-land/change`,
		editable: userHasUpdateCase,
		actionText: interestInLand !== null ? 'Change' : 'Add'
	});
};
