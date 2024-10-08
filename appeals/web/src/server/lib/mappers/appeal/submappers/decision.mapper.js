import { generateIssueDecisionUrl } from '#appeals/appeal-details/issue-decision/issue-decision.mapper.js';
import { APPEAL_CASE_STATUS } from 'pins-data-model';
import { textSummaryListItem } from '#lib/mappers/components/text.js';

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapDecision = ({ appealDetails, userHasUpdateCasePermission }) => {
	const canIssueDecision = !(
		appealDetails.decision?.outcome ||
		appealDetails.appealStatus !== APPEAL_CASE_STATUS.ISSUE_DETERMINATION
	);

	return textSummaryListItem({
		id: 'decision',
		text: 'Decision',
		value: appealDetails.decision?.outcome || 'Not yet issued',
		link: generateIssueDecisionUrl(appealDetails.appealId),
		userHasEditPermission: userHasUpdateCasePermission && canIssueDecision,
		actionText: 'Issue',
		classes: 'appeal-decision'
	});
};
