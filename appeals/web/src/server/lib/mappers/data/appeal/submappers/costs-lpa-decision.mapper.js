import { baseUrl } from '#appeals/appeal-details/issue-decision/issue-decision.utils.js';
import { permissionNames } from '#environment/permissions.js';
import { isStatePassed } from '#lib/appeal-status.js';
import { textSummaryListItem, userHasPermission } from '#lib/mappers/index.js';
import { isChildAppeal } from '#lib/mappers/utils/is-linked-appeal.js';
import { addBackLinkQueryToUrl } from '#lib/url-utilities.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';

/** @type {import('../mapper.js').SubMapper} */
export const mapCostsLpaDecision = ({ appealDetails, currentRoute, session, request }) => {
	const { lpaApplicationFolder, lpaWithdrawalFolder, lpaDecisionFolder } =
		appealDetails.costs ?? {};

	const lpaApplicationCount = lpaApplicationFolder?.documents?.length || 0;
	const lpaWithdrawalCount = lpaWithdrawalFolder?.documents?.length || 0;

	const isAppealWithdrawn = appealDetails.appealStatus === APPEAL_CASE_STATUS.WITHDRAWN;
	const isAppealPassedAwaitingEvent = isStatePassed(
		appealDetails,
		APPEAL_CASE_STATUS.AWAITING_EVENT
	);
	const isAppealInRequiredState = isAppealWithdrawn || isAppealPassedAwaitingEvent;

	if (
		isChildAppeal(appealDetails) ||
		!isAppealInRequiredState ||
		lpaApplicationCount <= lpaWithdrawalCount
	) {
		return { id: 'lpa-costs-decision', display: {} };
	}

	const editable =
		isAppealInRequiredState && userHasPermission(permissionNames.setCaseOutcome, session);

	const isIssued = lpaDecisionFolder?.documents?.length;

	const actionText = (() => {
		if (isIssued) {
			return 'View';
		}

		if (editable) {
			return 'Issue';
		}
	})();

	const link = isIssued
		? addBackLinkQueryToUrl(request, `${baseUrl(appealDetails)}/view-decision`)
		: addBackLinkQueryToUrl(
				request,
				`${currentRoute}/issue-decision/issue-lpa-costs-decision-letter-upload`
			);

	return textSummaryListItem({
		id: 'lpa-costs-decision',
		text: 'LPA costs decision',
		value: isIssued ? 'Issued' : 'Not issued',
		link,
		actionText,
		editable,
		classes: 'costs-lpa-decision'
	});
};
