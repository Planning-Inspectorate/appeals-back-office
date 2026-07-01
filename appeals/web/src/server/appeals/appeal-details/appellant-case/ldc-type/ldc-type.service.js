import { assertValidNumericIds } from '#lib/validators/api-parameters.validator.js';
/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} appellantCaseId
 * @param {string} applicationMadeUnderActSection
 * @returns {Promise<{}>}
 */
export function changeApplicationMadeUnderActSection(
	apiClient,
	appealId,
	appellantCaseId,
	applicationMadeUnderActSection
) {
	const ids = assertValidNumericIds({ appealId, appellantCaseId });
	return apiClient.patch(`appeals/${ids.appealId}/appellant-cases/${ids.appellantCaseId}`, {
		json: {
			applicationMadeUnderActSection: applicationMadeUnderActSection
		}
	});
}
