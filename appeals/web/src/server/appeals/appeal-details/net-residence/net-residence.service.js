import { assertValidNumericIds } from '#lib/validators/api-parameters.validator.js';
/**
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {string} appellantCaseId
 * @param {number | null} numberOfResidencesNetChange
 * @returns {Promise<{}>}
 */
export function changeNumberOfResidencesNetChange(
	apiClient,
	appealId,
	appellantCaseId,
	numberOfResidencesNetChange
) {
	const ids = assertValidNumericIds({ appealId, appellantCaseId });
	return apiClient.patch(`appeals/${ids.appealId}/appellant-cases/${ids.appellantCaseId}`, {
		json: {
			numberOfResidencesNetChange: numberOfResidencesNetChange
		}
	});
}
