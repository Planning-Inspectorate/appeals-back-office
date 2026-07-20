import { assertValidNumericIds } from '#lib/validators/api-parameters.validator.js';
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
	const ids = assertValidNumericIds({ appealId, lpaQuestionnaireId });
	return apiClient.patch(`appeals/${ids.appealId}/lpa-questionnaires/${ids.lpaQuestionnaireId}`, {
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
