import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import { textSummaryListItem, userHasPermission } from '#lib/mappers/index.js';
import { isStatePassed } from '#lib/appeal-status.js';
import { permissionNames } from '#environment/permissions.js';
import { addBackLinkQueryToUrl } from '#lib/url-utilities.js';
import { baseUrl } from '#appeals/appeal-details/issue-decision/issue-decision.utils.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapCostsAppellantDecision = ({ appealDetails, currentRoute, session, request }) => {
	const { appellantApplicationFolder, appellantWithdrawalFolder, appellantDecisionFolder } =
		appealDetails.costs ?? {};

	if (
		!isStatePassed(appealDetails, APPEAL_CASE_STATUS.AWAITING_EVENT) ||
		!appellantApplicationFolder?.documents?.length ||
		appellantWithdrawalFolder?.documents?.length
	) {
		return { id: 'appellant-costs-decision', display: {} };
	}

	const editable =
		isStatePassed(appealDetails, APPEAL_CASE_STATUS.AWAITING_EVENT) &&
		userHasPermission(permissionNames.setCaseOutcome, session);

	const isIssued = appellantDecisionFolder?.documents?.length;

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
				`${currentRoute}/issue-decision/issue-appellant-costs-decision-letter-upload`
		  );

	return textSummaryListItem({
		id: 'appellant-costs-decision',
		text: 'Appellant costs decision',
		value: isIssued ? 'Issued' : 'Not issued',
		link,
		actionText,
		editable,
		classes: 'costs-appellant-decision'
	});
};
