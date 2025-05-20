import { APPEAL_CASE_STATUS } from 'pins-data-model';
import { textSummaryListItem } from '#lib/mappers/index.js';
import { mapDocumentDownloadUrl } from '#appeals/appeal-documents/appeal-documents.mapper.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapCostsLpaDecision = ({
	appealDetails,
	currentRoute,
	userHasUpdateCasePermission
}) => {
	const { lpaApplicationFolder, lpaWithdrawalFolder, lpaDecisionFolder } =
		appealDetails.costs ?? {};

	if (
		lpaApplicationFolder?.documents?.length === 0 ||
		(lpaWithdrawalFolder?.documents?.length ?? 0) > 0
	) {
		return { id: 'lpa-costs-decision', display: {} };
	}

	const isIssued = (lpaDecisionFolder?.documents?.length ?? 0) > 0;

	const { id: documentId = '', name: documentName = '' } = lpaDecisionFolder?.documents?.[0] || {};

	const actionText = (() => {
		if (isIssued) {
			return 'View';
		}

		if (appealDetails.appealStatus === APPEAL_CASE_STATUS.ISSUE_DETERMINATION) {
			return 'Issue';
		}

		return '';
	})();

	return textSummaryListItem({
		id: 'lpa-costs-decision',
		text: 'LPA costs decision',
		value: isIssued ? 'Issued' : 'Not issued',
		link: isIssued
			? mapDocumentDownloadUrl(appealDetails.appealId, documentId, documentName)
			: `${currentRoute}/costs/lpa-decision`,
		actionText,
		editable: userHasUpdateCasePermission && Boolean(actionText),
		classes: 'costs-lpa-decision'
	});
};
