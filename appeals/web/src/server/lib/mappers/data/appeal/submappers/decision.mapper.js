import { APPEAL_CASE_STATUS } from 'pins-data-model';
import { textSummaryListItem } from '#lib/mappers/index.js';
import { userHasPermission } from '#lib/mappers/index.js';
import { permissionNames } from '#environment/permissions.js';
import { addBackLinkQueryToUrl } from '#lib/url-utilities.js';
import { isStatePassed } from '#lib/appeal-status.js';
import {
	baseUrl,
	generateIssueDecisionUrl,
	mapDecisionOutcome
} from '#appeals/appeal-details/issue-decision/issue-decision.utils.js';
import config from '#environment/config.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapDecision = ({ appealDetails, session, request }) => {
	const { appealId, appealStatus, decision } = appealDetails;

	const canIssueDecision =
		!decision?.outcome && appealStatus === APPEAL_CASE_STATUS.ISSUE_DETERMINATION;

	const editable =
		isStatePassed(appealDetails, APPEAL_CASE_STATUS.AWAITING_EVENT) &&
		userHasPermission(permissionNames.setCaseOutcome, session);

	const link = canIssueDecision
		? addBackLinkQueryToUrl(request, generateIssueDecisionUrl(appealId))
		: addBackLinkQueryToUrl(request, `${baseUrl(appealDetails)}/view-decision`);

	return textSummaryListItem({
		id: 'decision',
		text: 'Decision',
		value: mapDecisionOutcome(decision?.outcome || '') || 'Not issued',
		link,
		editable,
		actionText: canIssueDecision
			? 'Issue'
			: config.featureFlags.featureFlagIssueDecision
			? 'View'
			: '',
		classes: 'appeal-decision'
	});
};
