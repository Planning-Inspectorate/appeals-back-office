import { textSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapEnforcementIssueDate = ({ appellantCaseData, currentRoute, userHasUpdateCase }) => {
	const hasData = appellantCaseData.enforcementNotice?.issueDate !== null;
	return textSummaryListItem({
		id: 'enforcement-issue-date',
		text: 'What is the issue date on your enforcement notice?',
		value: hasData ? appellantCaseData.enforcementNotice?.issueDate : 'No data',
		link: `${currentRoute}/enforcement-notice-issue-date/change`,
		editable: hasData && userHasUpdateCase
	});
};
