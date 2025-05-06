import { APPEAL_CASE_STATUS } from 'pins-data-model';
import { textSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapCostsAppellantDecision = ({
	appealDetails,
	currentRoute,
	userHasUpdateCasePermission
}) => {
	const { appellantApplicationFolder, appellantWithdrawalFolder, appellantDecisionFolder } =
		appealDetails.costs ?? {};

	if (
		appellantApplicationFolder?.documents?.length === 0 ||
		(appellantWithdrawalFolder?.documents?.length ?? 0) > 0
	) {
		return { id: 'appellant-costs-decision', display: {} };
	}

	const isIssued = appellantDecisionFolder?.documents?.length ?? 0 > 0;

	const actionText = (() => {
		if (isIssued) {
			return 'View';
		}

		if (appealDetails.appealStatus === APPEAL_CASE_STATUS.ISSUE_DETERMINATION) {
			return 'Issue';
		}
	})();

	return textSummaryListItem({
		id: 'appellant-costs-decision',
		text: 'Appellant costs decision',
		value: isIssued ? 'Issued' : 'Not issued',
		link: `${currentRoute}/costs/appellant-decision`,
		actionText,
		editable: userHasUpdateCasePermission && Boolean(actionText),
		classes: 'costs-appellant-decision'
	});
};
