import { APPEAL_CASE_STATUS } from 'pins-data-model';
import { textSummaryListItem, userHasPermission } from '#lib/mappers/index.js';
import { mapDocumentDownloadUrl } from '#appeals/appeal-documents/appeal-documents.mapper.js';
import { isStatePassed } from '#lib/appeal-status.js';
import { permissionNames } from '#environment/permissions.js';
import { addBackLinkQueryToUrl } from '#lib/url-utilities.js';

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

	const { id: documentId = '', name: documentName = '' } =
		appellantDecisionFolder?.documents?.[0] || {};

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
