import { booleanSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapEnforcementNotice = ({ appellantCaseData, currentRoute, userHasUpdateCase }) => {
	const hasData = appellantCaseData.enforcementNotice?.isReceived !== null;
	return booleanSummaryListItem({
		id: 'enforcement-notice',
		text: 'Have you received an enforcement notice?',
		value: appellantCaseData.enforcementNotice?.isReceived,
		defaultText: 'No data',
		link: `${currentRoute}/enforcement-notice/change`,
		editable: hasData && userHasUpdateCase
	});
};
