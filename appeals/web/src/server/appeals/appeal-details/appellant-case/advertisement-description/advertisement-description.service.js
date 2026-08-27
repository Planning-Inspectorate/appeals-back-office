import { assertValidNumericIds } from '#lib/validators/api-parameters.validator.js';
/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} appellantCaseId
 * @param {string} updatedData
 * @returns {Promise<{}>}
 */
export function changeAdvertisementDescription(apiClient, appealId, appellantCaseId, updatedData) {
	const ids = assertValidNumericIds({ appealId, appellantCaseId });
	return apiClient.patch(`appeals/${ids.appealId}/appellant-cases/${ids.appellantCaseId}`, {
		json: {
			// uses developmentDescription in db
			developmentDescription: {
				details: updatedData
			}
		}
	});
}
