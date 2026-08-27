import { assertValidNumericIds } from '#lib/validators/api-parameters.validator.js';
/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} appellantCaseId
 * @param {any} updatedValues
 * @returns {Promise<{}>}
 */
export function changeSignificantChanges(apiClient, appealId, appellantCaseId, updatedValues) {
	const ids = assertValidNumericIds({ appealId, appellantCaseId });
	return apiClient.patch(`appeals/${ids.appealId}/appellant-cases/${ids.appellantCaseId}`, {
		json: {
			anySignificantChanges: updatedValues.anySignificantChanges,
			anySignificantChanges_localPlanSignificantChanges:
				updatedValues.anySignificantChanges_localPlanSignificantChanges,
			anySignificantChanges_nationalPolicySignificantChanges:
				updatedValues.anySignificantChanges_nationalPolicySignificantChanges,
			anySignificantChanges_courtJudgementSignificantChanges:
				updatedValues.anySignificantChanges_courtJudgementSignificantChanges,
			anySignificantChanges_otherSignificantChanges:
				updatedValues.anySignificantChanges_otherSignificantChanges
		}
	});
}
