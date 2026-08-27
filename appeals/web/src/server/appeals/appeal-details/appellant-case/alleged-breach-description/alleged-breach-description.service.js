import { assertValidNumericIds } from '#lib/validators/api-parameters.validator.js';
/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} appellantCaseId
 * @param {string} descriptionOfAllegedBreach
 * @returns {Promise<{}>}
 */
export function changeAllegedBreachDescription(
	apiClient,
	appealId,
	appellantCaseId,
	descriptionOfAllegedBreach
) {
	const ids = assertValidNumericIds({ appealId, appellantCaseId });
	return apiClient.patch(`appeals/${ids.appealId}/appellant-cases/${ids.appellantCaseId}`, {
		json: {
			descriptionOfAllegedBreach
		}
	});
}
