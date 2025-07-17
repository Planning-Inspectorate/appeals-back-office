import { textSummaryListItem } from '#lib/mappers/index.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';

/** @type {import('../mapper.js').SubMapper} */
export const mapAppealWithdrawal = ({
	appealDetails,
	currentRoute,
	userHasUpdateCasePermission
}) => {
	const appealHasWithdrawalDocuments =
		appealDetails?.withdrawal?.withdrawalFolder?.documents?.filter(
			(document) => document.latestDocumentVersion?.isDeleted === false
		).length;

	return appealDetails.appealStatus === APPEAL_CASE_STATUS.WITHDRAWN && appealHasWithdrawalDocuments
		? textSummaryListItem({
				id: 'appeal-withdrawal',
				text: 'Appeal withdrawal',
				link: `${currentRoute}/withdrawal/view`,
				editable: true,
				actionText: 'View'
		  })
		: textSummaryListItem({
				id: 'appeal-withdrawal',
				text: 'Appeal withdrawal',
				link: `${currentRoute}/withdrawal/start`,
				editable: userHasUpdateCasePermission,
				actionText: 'Start'
		  });
};
