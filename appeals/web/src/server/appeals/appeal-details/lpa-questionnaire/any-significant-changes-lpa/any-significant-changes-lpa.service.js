/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} lpaQuestionnaireId
 * @param {any} updatedValues
 * @returns {Promise<{}>}
 */
export function changeSignificantChangesLpa(
	apiClient,
	appealId,
	lpaQuestionnaireId,
	updatedValues
) {
	return apiClient.patch(`appeals/${appealId}/lpa-questionnaires/${lpaQuestionnaireId}`, {
		json: {
			anySignificantChangesLpa: updatedValues.anySignificantChangesLpa,
			anySignificantChangesLpa_localPlanSignificantChanges:
				updatedValues.anySignificantChangesLpa_localPlanSignificantChanges,
			anySignificantChangesLpa_nationalPolicySignificantChanges:
				updatedValues.anySignificantChangesLpa_nationalPolicySignificantChanges,
			anySignificantChangesLpa_courtJudgementSignificantChanges:
				updatedValues.anySignificantChangesLpa_courtJudgementSignificantChanges,
			anySignificantChangesLpa_otherSignificantChanges:
				updatedValues.anySignificantChangesLpa_otherSignificantChanges
		}
	});
}
