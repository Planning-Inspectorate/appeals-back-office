import { APPEAL_CASE_STATUS } from 'pins-data-model';

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapAppealWithdrawal = ({
	appealDetails,
	currentRoute,
	userHasUpdateCasePermission
}) => {
	const appealHasWithdrawalDocuments =
		appealDetails?.withdrawal?.withdrawalFolder?.documents?.filter(
			(document) => document.latestDocumentVersion?.isDeleted === false
		).length;

	const appealWithdrawalActionItem =
		appealDetails.appealStatus === APPEAL_CASE_STATUS.WITHDRAWN && appealHasWithdrawalDocuments
			? {
					text: 'View',
					href: `${currentRoute}/withdrawal/view`,
					visuallyHiddenText: 'View appeal withdrawal'
			  }
			: userHasUpdateCasePermission
			? {
					text: 'Start',
					href: `${currentRoute}/withdrawal/start`,
					visuallyHiddenText: 'Start appeal withdrawal'
			  }
			: undefined;

	return {
		id: 'appeal-withdrawal',
		display: {
			summaryListItem: {
				key: {
					text: 'Appeal withdrawal'
				},
				actions: {
					items: [appealWithdrawalActionItem]
				}
			}
		}
	};
};
