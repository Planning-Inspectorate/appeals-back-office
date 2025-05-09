import {
	generateIssueDecisionUrl,
	mapDecisionOutcome
} from '#appeals/appeal-details/issue-decision/issue-decision.mapper.js';
import { APPEAL_CASE_STATUS } from 'pins-data-model';
import { textSummaryListItem } from '#lib/mappers/index.js';
import { userHasPermission } from '#lib/mappers/index.js';
import { permissionNames } from '#environment/permissions.js';
import { addBackLinkQueryToUrl } from '#lib/url-utilities.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapDecision = ({ appealDetails, session, request }) => {
	const canIssueDecision = !(
		appealDetails.decision?.outcome ||
		appealDetails.appealStatus !== APPEAL_CASE_STATUS.ISSUE_DETERMINATION
	);

	return textSummaryListItem({
		id: 'decision',
		text: 'Decision',
		value: mapDecisionOutcome(appealDetails.decision?.outcome || '') || 'Not issued',
		link: addBackLinkQueryToUrl(request, generateIssueDecisionUrl(appealDetails.appealId)),
		editable: userHasPermission(permissionNames.setCaseOutcome, session) && canIssueDecision,
		actionText: 'Issue',
		classes: 'appeal-decision'
	});
};
