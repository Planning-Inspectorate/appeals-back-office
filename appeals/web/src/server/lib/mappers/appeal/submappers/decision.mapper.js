import { generateIssueDecisionUrl } from '#appeals/appeal-details/issue-decision/issue-decision.mapper.js';
import { APPEAL_CASE_STATUS } from 'pins-data-model';

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapDecision = ({ appealDetails }) => ({
	id: 'decision',
	display: {
		summaryListItem: {
			key: {
				text: 'Decision'
			},
			value: {
				text: appealDetails.decision?.outcome || 'Not yet issued'
			},
			actions: {
				items:
					appealDetails.decision?.outcome ||
					appealDetails.appealStatus !== APPEAL_CASE_STATUS.ISSUE_DETERMINATION
						? []
						: [
								{
									text: 'Issue',
									href: generateIssueDecisionUrl(appealDetails.appealId),
									visuallyHiddenText: 'decision'
								}
						  ]
			},
			classes: 'appeal-decision'
		}
	}
});
