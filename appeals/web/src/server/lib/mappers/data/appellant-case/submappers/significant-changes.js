import { booleanWithDetailsSummaryListItem } from '#lib/mappers/components/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapSignificantChanges = ({ appellantCaseData, currentRoute, userHasUpdateCase }) => {
	const details = [];
	if (appellantCaseData.anySignificantChanges_localPlanSignificantChanges) {
		details.push(
			`Local plan: ${appellantCaseData.anySignificantChanges_localPlanSignificantChanges}`
		);
	}
	if (appellantCaseData.anySignificantChanges_nationalPolicySignificantChanges) {
		details.push(
			`National policy: ${appellantCaseData.anySignificantChanges_nationalPolicySignificantChanges}`
		);
	}
	if (appellantCaseData.anySignificantChanges_courtJudgementSignificantChanges) {
		details.push(
			`Court judgment: ${appellantCaseData.anySignificantChanges_courtJudgementSignificantChanges}`
		);
	}
	if (appellantCaseData.anySignificantChanges_otherSignificantChanges) {
		details.push(`Other: ${appellantCaseData.anySignificantChanges_otherSignificantChanges}`);
	}

	return booleanWithDetailsSummaryListItem({
		id: 'any-significant-changes',
		text: 'Have there been any significant changes that would affect the application?',
		value: appellantCaseData.anySignificantChanges === 'Yes',
		valueDetails: details.join('\n'),
		link: `${currentRoute}/any-significant-changes/change`,
		editable: userHasUpdateCase,
		withShowMore: true
	});
};
