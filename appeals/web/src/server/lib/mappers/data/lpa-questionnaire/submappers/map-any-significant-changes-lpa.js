import { booleanWithDetailsSummaryListItem } from '#lib/mappers/components/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapAnySignificantChangesLpa = ({
	lpaQuestionnaireData,
	currentRoute,
	userHasUpdateCase
}) => {
	let details = [];
	if (lpaQuestionnaireData.anySignificantChangesLpa_localPlanSignificantChanges) {
		details.push(
			`Local plan: ${lpaQuestionnaireData.anySignificantChangesLpa_localPlanSignificantChanges}`
		);
	}
	if (lpaQuestionnaireData.anySignificantChangesLpa_nationalPolicySignificantChanges) {
		details.push(
			`National policy: ${lpaQuestionnaireData.anySignificantChangesLpa_nationalPolicySignificantChanges}`
		);
	}
	if (lpaQuestionnaireData.anySignificantChangesLpa_courtJudgementSignificantChanges) {
		details.push(
			`Court judgment: ${lpaQuestionnaireData.anySignificantChangesLpa_courtJudgementSignificantChanges}`
		);
	}
	if (lpaQuestionnaireData.anySignificantChangesLpa_otherSignificantChanges) {
		details.push(`Other: ${lpaQuestionnaireData.anySignificantChangesLpa_otherSignificantChanges}`);
	}

	return booleanWithDetailsSummaryListItem({
		id: 'any-significant-changes-lpa',
		text: 'Have there been any significant changes that would affect the application?',
		value: lpaQuestionnaireData.anySignificantChangesLpa === 'Yes',
		valueDetails: details.join('\n'),
		link: `${currentRoute}/any-significant-changes-lpa/change`,
		editable: userHasUpdateCase,
		withShowMore: true
	});
};
