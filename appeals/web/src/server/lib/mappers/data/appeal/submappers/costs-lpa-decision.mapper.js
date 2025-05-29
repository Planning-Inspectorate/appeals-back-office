import { APPEAL_CASE_STATUS } from 'pins-data-model';
import { textSummaryListItem, userHasPermission } from '#lib/mappers/index.js';
import { mapDocumentDownloadUrl } from '#appeals/appeal-documents/appeal-documents.mapper.js';
import { isStatePassed } from '#lib/appeal-status.js';
import { permissionNames } from '#environment/permissions.js';
import { addBackLinkQueryToUrl } from '#lib/url-utilities.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapCostsLpaDecision = ({ appealDetails, currentRoute, session, request }) => {
	const { lpaApplicationFolder, lpaWithdrawalFolder, lpaDecisionFolder } =
		appealDetails.costs ?? {};

	if (
		!isStatePassed(appealDetails, APPEAL_CASE_STATUS.AWAITING_EVENT) ||
		!lpaApplicationFolder?.documents?.length ||
		lpaWithdrawalFolder?.documents?.length
	) {
		return { id: 'lpa-costs-decision', display: {} };
	}

	const editable =
		isStatePassed(appealDetails, APPEAL_CASE_STATUS.AWAITING_EVENT) &&
		userHasPermission(permissionNames.setCaseOutcome, session);

	const isIssued = lpaDecisionFolder?.documents?.length;

	const { id: documentId = '', name: documentName = '' } = lpaDecisionFolder?.documents?.[0] || {};

	const actionText = (() => {
		if (isIssued) {
			return 'View';
		}

		if (editable) {
			return 'Issue';
		}
	})();

	const link = isIssued
		? mapDocumentDownloadUrl(appealDetails.appealId, documentId, documentName)
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
