import { assertValidNumericIds } from '#lib/validators/api-parameters.validator.js';
/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} appellantCaseId
 * @param {string|null} updatedPlanningObligationStatus
 * @returns {Promise<{}>}
 */
export function changePlanningObligationStatus(
	apiClient,
	appealId,
	appellantCaseId,
	updatedPlanningObligationStatus
) {
	const ids = assertValidNumericIds({ appealId, appellantCaseId });
	return apiClient.patch(`appeals/${ids.appealId}/appellant-cases/${ids.appellantCaseId}`, {
		json: {
			statusPlanningObligation: updatedPlanningObligationStatus
		}
	});
}
