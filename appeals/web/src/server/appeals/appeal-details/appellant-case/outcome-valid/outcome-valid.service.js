/** @typedef {import('#appeals/appeal-details/appeal-details.types').WebAppeal} Appeal */

/**
 *
 * @param {import('got').Got} apiClient
 * @param {string} appealId
 * @param {number} appellantCaseId
 * @param {string|null} validAt
 * @returns {Promise<Appeal>}
 */
export async function setReviewOutcomeValidForAppellantCase(
	apiClient,
	appealId,
	appellantCaseId,
	validAt
) {
	return await apiClient

		.patch(`appeals/${appealId}/appellant-cases/${appellantCaseId}`, {
			json: { validationOutcome: 'valid', validAt: validAt }
		})
		.json();
}
