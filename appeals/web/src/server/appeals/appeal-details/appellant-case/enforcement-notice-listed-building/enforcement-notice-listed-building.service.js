import { assertValidNumericIds } from '#lib/validators/api-parameters.validator.js';
/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} appellantCaseId
 * @param {boolean} enforcementNoticeListedBuilding
 * @returns {Promise<{}>}
 */
export function changeEnforcementNoticeListedBuilding(
	apiClient,
	appealId,
	appellantCaseId,
	enforcementNoticeListedBuilding
) {
	const ids = assertValidNumericIds({ appealId, appellantCaseId });
	return apiClient.patch(`appeals/${ids.appealId}/appellant-cases/${ids.appellantCaseId}`, {
		json: {
			enforcementNoticeListedBuilding
		}
	});
}
