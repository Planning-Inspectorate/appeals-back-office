import { assertValidNumericIds } from '#lib/validators/api-parameters.validator.js';
/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} appellantCaseId
 * @param {string} contactPlanningInspectorateDate
 * @returns {Promise<{}>}
 */
export function changeContactPlanningInspectorateDate(
	apiClient,
	appealId,
	appellantCaseId,
	contactPlanningInspectorateDate
) {
	const ids = assertValidNumericIds({ appealId, appellantCaseId });
	return apiClient.patch(`appeals/${ids.appealId}/appellant-cases/${ids.appellantCaseId}`, {
		json: {
			contactPlanningInspectorateDate
		}
	});
}
